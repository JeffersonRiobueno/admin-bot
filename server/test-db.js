import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'adminbot',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  });

  try {
    const [rows, fields] = await pool.query('SELECT id, nombre, mes, dia, equipo, estado, id_empleado FROM CUMPLES LIMIT 5');
    console.log('Rows:', rows);
    console.log('Columns:', (fields || []).map(f => f.name));
  } catch (err) {
    console.error('DB test error:', err);
    process.exitCode = 2;
  } finally {
    await pool.end();
  }
}

run();
