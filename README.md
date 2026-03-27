# CIESTA 4.0 — Official Website

**CIESTA** is the annual cultural and technical fest of the **Computer Science & Engineering Department** at **Dayananda Sagar College of Engineering (DSCE), Bangalore**. This repository contains the full source code for the CIESTA 4.0 official website, including the event registration system.

---

## Live Links

| | URL |
|---|---|
| **Website** | `https://anvesha-khandelwal.github.io/CIESTA/frontend/` |
| **Backend API** | `https://ciesta.onrender.com` |
| **Admin Panel** | `https://ciesta.onrender.com/admin?pass=ciesta2026` |

---

## Project Structure

```
CIESTA/
├── frontend/
│   ├── index.html          # Main landing page
│   └── register.html       # Event registration form
└── backend/
    ├── server.js           # Express + PostgreSQL backend
    ├── package.json
    └── node_modules/
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Hosting (Frontend) | GitHub Pages |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (Render) |
| Hosting (Backend) | Render (Free tier) |

---

## Features

- Event registration form with validation
- Stores registrations in a persistent PostgreSQL database
- Password-protected admin panel to view all registrations
- CSV export of all registrations
- Responsive design for mobile and desktop
- Animated UI with gradient backgrounds

---

## Events

CIESTA 4.0 runs from **April 9–11, 2026** and includes the following events:

- Treasure Hunt
- Literature Event
- Quiz
- Shark Tank
- Mystery Case
- Tech Survivor
- Fun Tech
- Faculty Event

---

## Registration System

When a participant fills out the form:
1. Data is validated on the frontend
2. Sent to the backend API via `POST /api/register`
3. Saved permanently in PostgreSQL database on Render
4. Admin can view all entries at `/admin?pass=ciesta2026`
5. Admin can download all entries as CSV at `/admin/csv?pass=ciesta2026`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/register` | Register a participant |
| `GET` | `/api/participants` | Get all participants (JSON) |
| `GET` | `/admin?pass=` | Admin panel (HTML table) |
| `GET` | `/admin/csv?pass=` | Download registrations as CSV |

### POST `/api/register` — Request Body

```json
{
  "name": "Arjun Sharma",
  "usn": "1DS21CS001",
  "college": "DSCE",
  "email": "arjun@example.com",
  "phone": "9999999999",
  "year": "2nd Year",
  "event": "Tech Survivor",
  "team": "Team Alpha",
  "time": "10:30 AM"
}
```

---

## Running Locally

### Prerequisites
- Node.js v18+
- Git

### Steps

```bash
# Clone the repo
git clone https://github.com/Anvesha-Khandelwal/CIESTA.git
cd CIESTA

# Install backend dependencies
cd backend
npm install

# Start the backend
npm start
# Server runs at http://localhost:3000
```

Then open `frontend/index.html` in your browser.

> For local development, change the API URL in `register.html` from
> `https://ciesta.onrender.com` to `http://localhost:3000`

---

## Deployment

### Frontend — GitHub Pages
Push to the `main` branch. GitHub Pages auto-deploys from `/frontend`.

### Backend — Render
1. Connect the GitHub repo to Render
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Add environment variable: `DATABASE_URL` → your PostgreSQL connection string

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string from Render |
| `PORT` | Server port (set automatically by Render) |

---

## Admin Panel

Access the admin panel at:
```
https://ciesta.onrender.com/admin?pass=ciesta2026
```

Features:
- View all registrations in a table
- See total count
- Download full CSV for Excel

> **Note:** Change the admin password in `server.js` before going live.

---

## Contributing

This project is maintained by the **CSE Cultural Team — Akira** at DSCE.

For any issues or suggestions, contact the development team.

---

## License

© 2026 CIESTA DSCE. All rights reserved.
