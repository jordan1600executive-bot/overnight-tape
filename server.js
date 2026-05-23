const WebSocket = require('ws');
const http = require('http');
const server = http.createServer();
const io = require('socket.io')(server, { cors: { origin: "*" } });

// Connect to the Massive data feed
const massiveWS = new WebSocket('wss://delayed.polygon.io/stocks');

massiveWS.on('open', () => {
  // Authenticate using your key from your first screenshot
  massiveWS.send(JSON.stringify({"action":"auth","params":"7YbyChnnKKvBeBAYPgJUI3tbiUpCq2a"}));
  
  // Subscribe to all raw trade prints across the market
  massiveWS.send(JSON.stringify({"action":"subscribe","params":"T.*"})); 
});

massiveWS.on('message', (data) => {
  const trades = JSON.parse(data);
  trades.forEach(t => {
    if(t.ev === 'T') {
      // Force the legal 15-minute delay queue (900,000 milliseconds)
      setTimeout(() => { 
        io.emit('trade', { s: t.sym, p: t.p, v: t.s, t: t.t }); 
      }, 900000); 
    }
  });
});

// Listen on the server port provided by the host environment
server.listen(process.env.PORT || 3000);
