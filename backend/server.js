const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const dbPath = path.join(__dirname, 'participants.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to the SQLite database.');

    // Create table with all required columns including email and phone
    db.run(`CREATE TABLE IF NOT EXISTS participants (
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
    )`, (createErr) => {
        if (createErr) {
            console.error('Error creating table:', createErr.message);
            return;
        }

        // Migration: safely add email and phone columns if they don't exist yet
        db.run(`ALTER TABLE participants ADD COLUMN email TEXT`, (e) => {
            if (e && !e.message.includes('duplicate column')) {
                console.error('Migration error (email):', e.message);
            }
        });
        db.run(`ALTER TABLE participants ADD COLUMN phone TEXT`, (e) => {
            if (e && !e.message.includes('duplicate column')) {
                console.error('Migration error (phone):', e.message);
            }
        });
    });
});

// GET all participants
app.get('/api/participants', (req, res) => {
    db.all('SELECT * FROM participants ORDER BY id ASC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST register a participant
app.post('/api/register', (req, res) => {
    const { name, usn, college, event, team, year, time, email, phone } = req.body;

    if (!name || !usn || !college || !event || !year || !time) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    const sql = `INSERT INTO participants (name, usn, college, event, team, year, time, email, phone)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [name, usn, college, event, team || null, year, time, email || null, phone || null];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('DB insert error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }

        // Log to text file
        const logPath = path.join(__dirname, 'registrations.txt');
        const logEntry = `${new Date().toISOString()} | ${name} | ${usn} | ${college} | ${event} | ${team || 'N/A'} | ${year} | ${email || 'N/A'} | ${phone || 'N/A'}\n`;

        fs.appendFile(logPath, logEntry, (fsErr) => {
            if (fsErr) console.error('Error writing to registrations.txt:', fsErr);
        });

        res.status(201).json({
            id: this.lastID,
            name, usn, college, event, team: team || null, year, time, email: email || null, phone: phone || null
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${3000}`);
});
