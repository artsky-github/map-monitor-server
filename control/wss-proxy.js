require("dotenv").config({ path: "../.env" });
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");
const https = require("https");
const db = require("../model/mongo");

const httpsServer = https.createServer({
  key: fs.readFileSync(path.join(__dirname, process.env.WSS_KEY_PATH)),
  cert: fs.readFileSync(path.join(__dirname, process.env.WSS_CERT_PATH)),
});

const wss = new WebSocket.Server({ server: httpsServer });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log("Recieved from client: " + message);
    db.insertMapStatus(JSON.parse(message));
  });

  ws.on("close", (client) => {
    console.log(`Client ${client} disconnected.`);
  });
});

httpsServer.listen(process.env.WSS_PORT, process.env.WSS_IP, () => {
  console.log(
    "---------------------------------------------------------------------"
  );
  console.log(
    `${new Date().toLocaleString()} : WSS Server Created at https://${
      process.env.WSS_IP
    }:${process.env.WSS_PORT}`
  );
  console.log(
    "---------------------------------------------------------------------"
  );
});
