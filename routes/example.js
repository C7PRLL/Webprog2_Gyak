// Példa route kezelő
// src/routes/example.js

const handleExample = (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        message: 'Példa API végpont',
        timestamp: new Date().toISOString(),
        path: req.url
    }));
};

module.exports = { handleExample };