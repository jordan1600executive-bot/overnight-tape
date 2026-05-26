const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } });

// This function "fakes" a stream by polling Yahoo Finance
async function pollYahoo(symbol, socket) {
    try {
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
        const data = await res.json();
        const price = data.chart.result[0].meta.regularMarketPrice;
        
        // Push this price to your tape
        socket.emit('trade', { s: symbol, p: price, v: 100, t: Date.now() });
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

io.on('connection', (socket) => {
    let interval;
    socket.on('subscribe', (symbol) => {
        clearInterval(interval);
        interval = setInterval(() => pollYahoo(symbol, socket), 3000); // Updates every 3 seconds
    });
});

server.listen(3000, () => console.log('Tape Server Running'));
