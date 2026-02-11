import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const GENERIC_PASSWORD = process.env.GENERIC_PASSWORD || 'ChangeMe123!';

// Simple in-memory token blacklist for logout (not persistent)
const tokenBlacklist = new Map(); // token -> expiryTimestamp

// periodic cleanup of blacklist
setInterval(() => {
  const now = Date.now();
  for (const [t, exp] of tokenBlacklist.entries()) {
    if (exp <= now) tokenBlacklist.delete(t);
  }
}, 60 * 1000);

const authenticateToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.slice(7);
  if (tokenBlacklist.has(token)) return res.status(401).json({ error: 'Token revoked' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'adminbot',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend build if present (allows single-container deployment)
try {
  const clientDist = path.resolve(__dirname, '../dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
} catch (e) {
  console.warn('Error checking/serving client build:', e);
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Auth endpoints
app.post('/api/login', async (req, res) => {
  const { user, pass } = req.body || {};
  if (!user || !pass) return res.status(400).json({ error: 'Missing credentials' });
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT id, `user`, pass, `number`, status, IFNULL(`first`, 0) as `first` FROM CUMPLES_USERS WHERE `user` = ? LIMIT 1', [user]);
      const row = rows[0];
      if (!row) return res.status(401).json({ error: 'Invalid credentials' });
      // If stored pass looks like bcrypt hash, compare using bcrypt; otherwise compare plain
      let ok = false;
      if (typeof row.pass === 'string' && (row.pass.startsWith('$2a$') || row.pass.startsWith('$2b$') || row.pass.startsWith('$2y$'))) {
        ok = await bcrypt.compare(pass, row.pass);
      } else {
        ok = pass === row.pass;
      }
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      // If this is a first-time account (or pass still matches generic), require password change
      if (row.first == 1 || String(row.pass) === GENERIC_PASSWORD) {
        return res.json({ mustChange: true, userId: row.id });
      }
      if (row.status === 0 || String(row.status).toLowerCase() === 'inactive' || String(row.status).toLowerCase() === 'false') {
        return res.status(403).json({ error: 'User inactive' });
      }
      const payload = { id: row.id, user: row.user, number: row.number };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
      res.json({ token, user: payload });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Change password endpoint: accepts { user, currentPass, newPass }
// Allows changing password for first-time or regular users by verifying current password.
app.post('/api/change-password', async (req, res) => {
  const { user, currentPass, newPass } = req.body || {};
  if (!user || !currentPass || !newPass) return res.status(400).json({ error: 'Missing parameters' });
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT id, `user`, pass, IFNULL(`first`, 0) as `first` FROM CUMPLES_USERS WHERE `user` = ? LIMIT 1', [user]);
      const row = rows[0];
      if (!row) return res.status(404).json({ error: 'User not found' });
      // verify currentPass
      let ok = false;
      if (typeof row.pass === 'string' && (row.pass.startsWith('$2a$') || row.pass.startsWith('$2b$') || row.pass.startsWith('$2y$'))) {
        ok = await bcrypt.compare(currentPass, row.pass);
      } else {
        ok = currentPass === row.pass;
      }
      if (!ok) return res.status(401).json({ error: 'Current password incorrect' });
      // hash new password and update
      const hashed = await bcrypt.hash(newPass, 12);
      await conn.execute('UPDATE CUMPLES_USERS SET pass = ?, `first` = 0, upd_change = NOW() WHERE id = ?', [hashed, row.id]);
      return res.json({ ok: true });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('change-password error', err);
    return res.status(500).json({ error: 'Change password failed' });
  }
});

app.post('/api/logout', authenticateToken, (req, res) => {
  try {
    const auth = req.headers.authorization;
    const token = auth.slice(7);
    // decode without verifying to get exp
    try {
      const decoded = jwt.decode(token);
      const exp = decoded && decoded.exp ? decoded.exp * 1000 : Date.now() + (60 * 60 * 1000);
      tokenBlacklist.set(token, exp);
    } catch (e) {
      tokenBlacklist.set(token, Date.now() + (60 * 60 * 1000));
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error('Logout error', err);
    return res.status(500).json({ error: 'Logout failed' });
  }
});

app.get('/api/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Validation endpoint to check reading the CUMPLES table and expected columns
app.get('/api/validate-cumple', async (_req, res) => {
  const expected = ['id', 'nombre', 'mes', 'dia', 'equipo', 'estado', 'id_empleado'];
  try {
    const conn = await pool.getConnection();
    try {
      const [rows, fields] = await conn.query('SELECT id, nombre, mes, dia, equipo, estado, id_empleado FROM CUMPLES LIMIT 10');
      const fieldNames = (fields || []).map(f => f.name);
      const missing = expected.filter(col => !fieldNames.includes(col));
      res.json({ ok: true, rows, missingColumns: missing });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Error validating CUMPLES table:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Users
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    // Read birthdays from CUMPLES table only
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT id, nombre, mes, dia, equipo, estado, id_empleado FROM CUMPLES ORDER BY nombre');
      res.json(rows);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT id, nombre, mes, dia, equipo, estado, id_empleado FROM CUMPLES WHERE id = ?', [req.params.id]);
      res.json(rows[0] || null);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  const { nombre, mes, dia, equipo, estado, id_empleado } = req.body;
  try {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        'INSERT INTO CUMPLES (nombre, mes, dia, equipo, estado, id_empleado) VALUES (?, ?, ?, ?, ?, ?)',
        [nombre, mes, dia, equipo, estado ? 1 : 0, id_empleado]
      );
      res.status(201).json({ id: result.insertId });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating user' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  const { nombre, mes, dia, equipo, estado, id_empleado } = req.body;
  try {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        'UPDATE CUMPLES SET nombre = ?, mes = ?, dia = ?, equipo = ?, estado = ?, id_empleado = ? WHERE id = ?',
        [nombre, mes, dia, equipo, estado ? 1 : 0, id_empleado, req.params.id]
      );
      res.json({ updated: true });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating user' });
  }
});


// Groups (new schema: id, name, sku, group_id, path_url, status)
app.get('/api/groups', authenticateToken, async (_req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT id, name, sku, group_id, path_url, status FROM CUMPLES_GROUP ORDER BY name');
      res.json(rows);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching groups' });
  }
});

app.post('/api/groups', authenticateToken, async (req, res) => {
  try {
    const { name, sku, group_id, path_url, status } = req.body;
    // normalize status to 'True' or 'False'
    const s = (status === true || status === 1 || String(status).toLowerCase() === 'true' || String(status) === '1') ? 'True' : 'False';
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        'INSERT INTO CUMPLES_GROUP (name, sku, group_id, path_url, status) VALUES (?, ?, ?, ?, ?)',
        [name, sku, group_id, path_url, s]
      );
      res.status(201).json({ id: result.insertId });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating group' });
  }
});

app.put('/api/groups/:id', authenticateToken, async (req, res) => {
  try {
    const { name, sku, group_id, path_url, status } = req.body;
    const s = (status === true || status === 1 || String(status).toLowerCase() === 'true' || String(status) === '1') ? 'True' : 'False';
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        'UPDATE CUMPLES_GROUP SET name = ?, sku = ?, group_id = ?, path_url = ?, status = ? WHERE id = ?',
        [name, sku, group_id, path_url, s, req.params.id]
      );
      res.json({ updated: true });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating group' });
  }
});

app.delete('/api/groups/:id', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.execute('DELETE FROM CUMPLES_GROUP WHERE id = ?', [req.params.id]);
      res.json({ deleted: true });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting group' });
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
const server = app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));

// Graceful shutdown: close HTTP server and DB pool
const shutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  try {
    server.close(() => console.log('HTTP server closed'));
    await pool.end();
    console.log('Database pool closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', async (err) => {
  console.error('Uncaught exception, shutting down', err);
  try { await pool.end(); } catch (e) { console.error('Error closing pool after exception', e); }
  process.exit(1);
});
