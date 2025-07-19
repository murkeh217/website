const express = require('express');
const useragent = require('useragent');
const geoip = require('geoip-lite');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (HTML/CSS/JS) from the public directory
app.use(express.static('public'));

// Middleware to log IP, device info, and geo-location
app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const agent = useragent.parse(req.headers['user-agent']);
    const geo = geoip.lookup(ip);

    const log = `
    [${new Date().toISOString()}]
    IP: ${ip}
    Country: ${geo?.country || 'Unknown'}
    City: ${geo?.city || 'Unknown'}
    Region: ${geo?.region || 'Unknown'}
    Device: ${agent.device.toString()}
    OS: ${agent.os.toString()}
    Browser: ${agent.toAgent()}
    User-Agent: ${req.headers['user-agent']}
    --------------------------------------------------
    `;

    console.log(log); // Optional: also print to console

    fs.appendFile(path.join(__dirname, 'visitor_log.txt'), log, err => {
        if (err) console.error('Logging error:', err);
    });

        next();
});

// Optional fallback for unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
