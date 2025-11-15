const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Read data
app.get('/api/data', (req, res) => {
    try {
        const data = fs.readFileSync('data.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// Save data
app.post('/api/data', (req, res) => {
    try {
        const data = JSON.stringify(req.body, null, 2);
        fs.writeFileSync('data.json', data, 'utf8');
        console.log('✅ Data saved successfully!');
        res.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        console.error('❌ Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║  💕 Our Wheel of Fun Server 💕        ║
    ║                                        ║
    ║  🌐 Server running on:                 ║
    ║     http://localhost:${PORT}              ║
    ║                                        ║
    ║  📱 Access from other devices:         ║
    ║     Find your IP with: ipconfig       ║
    ║     Then use: http://YOUR-IP:${PORT}     ║
    ║                                        ║
    ║  ✨ Data will be saved to data.json    ║
    ╚════════════════════════════════════════╝
    `);
});
