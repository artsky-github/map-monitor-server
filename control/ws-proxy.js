require("dotenv").config({path : "../.env"}); 
const WebSocket = require("ws");
const db = require("../model/mongo");

const wss = new WebSocket.Server({ host: process.env.WSS_IP, port: process.env.WSS_PORT});
console.log("WebSocket Server has been created on port 4000");

wss.on("connection", function connection(ws) {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log("Recieved from client: " + message);
    db.insertMapStatus(JSON.parse(message));
  });

  ws.on("close", function close() {
    console.log("Client disconnected");
  });
});
