const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ── PostgreSQL Connection ───────────────────────────────────────
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ── Create table if not exists ──────────────────────────────────
async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS participants (
                id      SERIAL PRIMARY KEY,
                name    TEXT NOT NULL,
                usn     TEXT NOT NULL,
                branch  TEXT NOT NULL,
                event   TEXT NOT NULL,
                team    TEXT,
                year    TEXT NOT NULL,
                time    TEXT NOT NULL,
                email   TEXT,
                phone   TEXT
            )
        `);
        // Rename column if old DB still has 'college'
        await pool.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name='participants' AND column_name='college'
                ) THEN
                    ALTER TABLE participants RENAME COLUMN college TO branch;
                END IF;
            END $$;
        `);
        console.log('✅ Database ready.');
    } catch (err) {
        console.error('❌ DB init error:', err.message);
    }
}
initDB();

// ── ADMIN PASSWORD ──────────────────────────────────────────────
const ADMIN_PASS = 'ciesta2026';

// ── Admin HTML page ─────────────────────────────────────────────
app.get('/admin', async (req, res) => {
    if (req.query.pass !== ADMIN_PASS) {
        return res.send(`
            <html><body style="background:#111;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
            <div style="text-align:center">
                <h2 style="margin-bottom:1rem">CIESTA Admin</h2>
                <form action="/admin" method="get">
                    <input name="pass" type="password" placeholder="Enter password"
                        style="padding:10px;border-radius:6px;border:none;margin-right:8px;font-size:15px">
                    <button type="submit"
                        style="padding:10px 20px;background:#7c3aed;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:15px">
                        Login
                    </button>
                </form>
            </div></body></html>
        `);
    }

    try {
        const { rows } = await pool.query('SELECT * FROM participants ORDER BY id DESC');

        const tableRows = rows.map(r => `
            <tr>
                <td>${r.id}</td>
                <td>${r.name}</td>
                <td>${r.usn}</td>
                <td>${r.branch}</td>
                <td>${r.event}</td>
                <td>${r.year}</td>
                <td>${r.team || '—'}</td>
                <td>${r.email || '—'}</td>
                <td>${r.phone || '—'}</td>
                <td>${r.time}</td>
            </tr>
        `).join('');

        res.send(`
            <html>
            <head>
            <title>CIESTA Admin</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                *{box-sizing:border-box;margin:0;padding:0}
                body{background:#0a0a0f;color:#e2e8f0;font-family:'Segoe UI',sans-serif;padding:2rem}
                h1{font-size:1.5rem;margin-bottom:0.5rem;color:#a78bfa}
                .meta{color:#64748b;font-size:0.85rem;margin-bottom:1.5rem}
                .btn{display:inline-block;padding:0.6rem 1.2rem;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-size:0.85rem;margin-bottom:1.5rem}
                .btn:hover{background:#6d28d9}
                .table-wrap{overflow-x:auto}
                table{width:100%;border-collapse:collapse;font-size:0.82rem;min-width:800px}
                th{background:#1e1e2e;padding:0.75rem 1rem;text-align:left;color:#94a3b8;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #1e1e2e}
                td{padding:0.75rem 1rem;border-bottom:1px solid #1a1a2a;color:#e2e8f0}
                tr:hover td{background:#111120}
                .empty{text-align:center;padding:3rem;color:#64748b}
            </style>
            </head>
            <body>
                <h1>CIESTA 4.0 — Registrations</h1>
                <p class="meta">Total: <strong style="color:#a78bfa">${rows.length}</strong> registrations</p>
                <a class="btn" href="/admin/csv?pass=${ADMIN_PASS}">⬇ Download CSV</a>
                <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>#</th><th>Name</th><th>USN</th><th>Branch</th>
                            <th>Event</th><th>Year</th><th>Team</th>
                            <th>Email</th><th>Phone</th><th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows || '<tr><td colspan="10" class="empty">No registrations yet</td></tr>'}
                    </tbody>
                </table>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send('Database error: ' + err.message);
    }
});

// ── CSV Download ────────────────────────────────────────────────
app.get('/admin/csv', async (req, res) => {
    if (req.query.pass !== ADMIN_PASS) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { rows } = await pool.query('SELECT * FROM participants ORDER BY id ASC');
        const escape = v => '"' + String(v || '').replace(/"/g, '""') + '"';
        const header = 'ID,Name,USN,Branch,Event,Year,Team,Email,Phone,Time\n';
        const csv = rows.map(r =>
            [r.id, r.name, r.usn, r.branch, r.event, r.year,
             r.team || '', r.email || '', r.phone || '', r.time]
            .map(escape).join(',')
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="ciesta-registrations.csv"');
        res.send(header + csv);
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});

// ── API: GET all participants ────────────────────────────────────
app.get('/api/participants', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM participants ORDER BY id ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── API: POST register ──────────────────────────────────────────
app.post('/api/register', async (req, res) => {
    const { name, usn, branch, event, team, year, time, email, phone } = req.body;

    if (!name || !usn || !branch || !event || !year || !time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO participants (name, usn, branch, event, team, year, time, email, phone)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id`,
            [name, usn, branch, event, team || null, year, time, email || null, phone || null]
        );

        console.log(`✅ Registered: ${name} | ${event}`);

        res.status(201).json({
            id: result.rows[0].id,
            name, usn, branch, event,
            team: team || null, year, time,
            email: email || null,
            phone: phone || null
        });
    } catch (err) {
        console.error('DB error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});