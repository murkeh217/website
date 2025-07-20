const express = require('express');
const useragent = require('express-useragent');
const fs = require('fs');
const path = require('path');
const geoip = require('geoip-lite');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Set up SQLite DB
const db = new sqlite3.Database('user_logs.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        ip TEXT,
        browser TEXT,
        os TEXT,
        platform TEXT,
        city TEXT,
        region TEXT,
        country TEXT
    )`);
});

// Middleware
app.use(useragent.express());

app.get('/', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ua = req.useragent;
    const geo = geoip.lookup(ip) || {};

    const log = {
        timestamp: new Date().toISOString(),
        ip,
        browser: ua.browser,
        os: ua.os,
        platform: ua.platform,
        city: geo.city || 'Unknown',
        region: geo.region || 'Unknown',
        country: geo.country || 'Unknown'
    };

    // Log to file
    const logString = `
    Time: ${log.timestamp}
    IP: ${log.ip}
    Browser: ${log.browser}
    OS: ${log.os}
    Platform: ${log.platform}
    Location: ${log.city}, ${log.region}, ${log.country}
    ==============================
    `;
    fs.appendFileSync(path.join(__dirname, 'logs.txt'), logString);
    console.log(logString);

    // Log to DB
    db.run(
        `INSERT INTO logs (timestamp, ip, browser, os, platform, city, region, country)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
           [
               log.timestamp,
           log.ip,
           log.browser,
           log.os,
           log.platform,
           log.city,
           log.region,
           log.country
           ]
    );

    res.send(`
    <html>
    <head><title>User Logger</title></head>
    <body>
    <h1>Hello, your visit has been logged with location!</h1>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
