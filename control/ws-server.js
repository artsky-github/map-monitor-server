const WebSocket = require("ws");



function createWSS() {
    const wss = new WebSocket.Server({port: 3030});
    console.log("WS Server has been created on localhost:3030")

    wss.on('connection', (ws) => {
        console.log("WebSocket Connection Established");

        ws.on("message", (message) => {
            console.log("Recieved", message);
            ws.send('Echo:' + message);
        })
    })
}

module.exports = { createWSS };