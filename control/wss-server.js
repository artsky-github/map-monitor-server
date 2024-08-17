require("dotenv").config({ path: "../.env" });
const db = require("../model/mongo-client");
const path = require("path");
const fs = require("fs");
const WebSocket = require("ws");
const https = require("https");

const keyFile = path.join(__dirname, process.env.HTTPS_KEY_PATH);
const certFile = path.join(__dirname, process.env.HTTPS_CERT_PATH);

// Creates an HTTPS server that upgrades to WSS.
function createSecureServerWS(keyFile, certFile) {
  const httpsServer = https.createServer({
    key: fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile),
  });
  httpsServer.listen(process.env.HTTPS_PORT, process.env.HTTPS_IP);
  return new WebSocket.Server({ server: httpsServer });
}

const wss = createSecureServerWS(keyFile, certFile);

wss.on("connection", (ws) => {
  // On connection, begin feeding data in intervals.
  const timelySendData = setInterval(() => {
    db.getAllHostData().then((response) => {
      ws.send(JSON.stringify(response));
    });
  }, 15000);

  // When connection closes, GC the Timeout object.
  ws.on("close", () => {
    clearInterval(timelySendData);
  });
});
