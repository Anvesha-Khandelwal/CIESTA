const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Google Sheets logger
const https = require('https');
const url = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const dbPath = path.join(__dirname, 'participants.db');
const db = new Database(dbPath);
console.log('Connected to the SQLite database.');

// Create table
db.exec(`CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    usn TEXT NOT NULL,
    college TEXT NOT NULL,
    event TEXT NOT NULL,
    team TEXT,
    year TEXT NOT NULL,
    time TEXT NOT NULL,
    email TEXT,
    phone TEXT
)`);

// Migration
try { db.exec(`ALTER TABLE participants ADD COLUMN email TEXT`); }
catch (e) { if (!e.message.includes('duplicate column')) console.error('Migration error (email):', e.message); }

try { db.exec(`ALTER TABLE participants ADD COLUMN phone TEXT`); }
catch (e) { if (!e.message.includes('duplicate column')) console.error('Migration error (phone):', e.message); }


// Google Sheets logger
function logToSheet(data) {
    try {
        const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwHe4EZOuweaD0aLm4TyMoDBL8eQkAmPvgNUSqPRcPpqQ6WG92-Rb19ivW422I6vrUMXA/exec';
        const body = JSON.stringify(data);
        const parsedUrl = url.parse(SHEET_URL);

        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(options, (res) => {
            console.log('Sheet log status:', res.statusCode);
        });

        req.on('error', (e) => console.error('Sheet logging failed:', e.message));
        req.write(body);
        req.end();

    } catch (err) {
        console.error('Sheet logging error:', err.message);
    }
}
// GET all participants
app.get('/api/participants', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM participants ORDER BY id ASC').all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST register a participant
app.post('/api/register', (req, res) => {
    const { name, usn, college, event, team, year, time, email, phone } = req.body;

    if (!name || !usn || !college || !event || !year || !time) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    try {
        const stmt = db.prepare(`INSERT INTO participants (name, usn, college, event, team, year, time, email, phone)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        const result = stmt.run(name, usn, college, event, team || null, year, time, email || null, phone || null);

        // Log to Google Sheet
        logToSheet({
            id: result.lastInsertRowid,
            name, usn, college, event,
            team: team || '—',
            year, time,
            email: email || '—',
            phone: phone || '—'
        });

        res.status(201).json({
            id: result.lastInsertRowid,
            name, usn, college, event,
            team: team || null, year, time,
            email: email || null,
            phone: phone || null
        });

    } catch (err) {
        console.error('DB insert error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});