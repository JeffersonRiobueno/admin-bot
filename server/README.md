# AdminPro API server

This is a minimal Express API to provide CRUD endpoints for `users` and `groups` backed by MySQL.

Setup:

1. Copy `.env.example` to `.env` in the `server` folder and fill your credentials.

2. Install dependencies (from `server`):

```bash
cd server
npm install
```

3. Start the server:

```bash
npm start
# or (dev with nodemon)
npm run dev
```

API endpoints (basic contract):
- `GET /api/users` - list all users
- `GET /api/users/:id` - get single user
- `POST /api/users` - create user (body: `nombre, mes, dia, equipo, estado, id_empleado`)
- `PUT /api/users/:id` - update user (same body)
- `PATCH /api/users/:id/deactivate` - mark `estado = 'Inactivo'`

- `GET /api/groups` - list groups
- `POST /api/groups` - create group (body: `equipo, group_id, plantilla`)
- `PUT /api/groups/:id` - update group
- `DELETE /api/groups/:id` - delete group

Minimal SQL schema example:

```sql
-- The current app lists birthdays from the `CUMPLES` table.

CREATE TABLE CUMPLES (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  mes VARCHAR(50),
  dia INT,
  equipo VARCHAR(100),
  estado VARCHAR(50),
  id_empleado VARCHAR(50)
);

-- Optionally, you can create a `groups` table later for the Groups menu.
```

Notes:
- The server intentionally keeps logic simple; authentication and validation should be added for production.

Validation utilities:
- `GET /api/validate-cumple` - queries the `CUMPLE` table and returns up to 10 rows plus any missing expected columns (`id,nombre,mes,dia,equipo,estado,id_empleado`).
- `node test-db.js` - run this in the `server/` folder after installing deps to print a small sample from `CUMPLE`.
