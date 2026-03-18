const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const dbPath = path.join(__dirname, 'participants.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            usn TEXT NOT NULL,
            college TEXT NOT NULL,
            event TEXT NOT NULL,
            team TEXT,
            year TEXT NOT NULL,
            time TEXT NOT NULL
        )`);
    }
});

app.get('/api/participants', (req, res) => {
    db.all('SELECT * FROM participants ORDER BY id ASC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/register', (req, res) => {
    const { name, usn, college, event, team, year, time, email, phone } = req.body;
    
    if (!name || !usn || !college || !event || !year || !time) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    const sql = `INSERT INTO participants (name, usn, college, event, team, year, time) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [name, usn, college, event, team, year, time];
    
    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Log to text file
        const fs = require('fs');
        const logPath = path.join(__dirname, 'registrations.txt');
        const logEntry = `${new Date().toISOString()} | ${name} | ${usn} | ${college} | ${event} | ${team || 'N/A'} | ${year} | ${email || 'N/A'} | ${phone || 'N/A'}\n`;
        
        fs.appendFile(logPath, logEntry, (fsErr) => {
            if (fsErr) {
                console.error('Error writing to registrations.txt:', fsErr);
            }
        });

        res.status(201).json({ 
            id: this.lastID,
            name, usn, college, event, team, year, time 
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
