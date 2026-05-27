const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// CORS setup to allow your website to communicate with your proxy
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/stock/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    // allorigins is a reliable public proxy for Yahoo Finance data
    const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Proxy error status: ${response.status}`);
        }

        const data = await response.json();
        
        // allorigins wraps the content in a 'contents' string, so we need to parse it back
        const actualData = JSON.parse(data.contents);
        res.json(actualData);
        
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch data via proxy" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
