const express = require('express');
const useragent = require('useragent');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));

// Logging middleware
app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const agent = useragent.parse(req.headers['user-agent']);

    const log = `
    [${new Date().toISOString()}]
    IP: ${ip}
    Device: ${agent.device.toString()}
    OS: ${agent.os.toString()}
    Browser: ${agent.toAgent()}
    User-Agent: ${req.headers['user-agent']}
    --------------------------------------------------
    `;

    console.log(log); // Optional: log to console

    // Append to visitor_log.txt
    fs.appendFile(path.join(__dirname, 'visitor_log.txt'), log, err => {
        if (err) console.error('Failed to log visitor info:', err);
    });

        next();
});

// Default route fallback (optional)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Static site served at http://localhost:${PORT}`);
});
