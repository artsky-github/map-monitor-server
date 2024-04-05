const WebSocket = require("ws");
const db = require("../model/mongo");

const wss = new WebSocket.Server({ port: 4000 });
console.log("WebSocket Server has been created on port 4000");

wss.on("connection", function connection(ws) {
  console.log("Client connected");

  ws.on("message", (message) => {
    message = message.toString();
    try {
      db.insertMapStatus(JSON.parse(message));
      ws.send("Success");
    } catch {
      db.queryMapStatus(message).then((mapStatus) => {
        ws.send(JSON.stringify(mapStatus));
      });
    }
  });
  ws.on("close", function close() {
    console.log("Client disconnected");
  });
});
