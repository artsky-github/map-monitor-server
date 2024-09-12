require("dotenv").config({ path: "../.env" });
const db = require("../model/mongo-client");
const path = require("path");
const fs = require("fs");
const WebSocket = require("ws");
const https = require("https");

const HTTPS_IP = process.env.HTTPS_IP;
const HTTPS_PORT = process.env.HTTPS_PORT;
const ROOT_KEY_PATH = process.env.ROOT_KEY_PATH;
const ROOT_CERT_PATH = process.env.ROOT_CERT_PATH;

const keyFile = path.join(__dirname, "..", ROOT_KEY_PATH);
const certFile = path.join(__dirname, "..", ROOT_CERT_PATH);

const wss = createSecureServerWS(keyFile, certFile);

// Creates an HTTPS server that upgrades to WSS.
function createSecureServerWS(keyFile, certFile) {
  const httpsServer = https.createServer({
    key: fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile),
  });
  httpsServer.listen(HTTPS_PORT, HTTPS_IP);
  return new WebSocket.Server({ server: httpsServer });
}

// On connection, begin feeding data in intervals.
wss.on("connection", (ws) => {

  db.getAllHostData().then((response) => {
    ws.send(JSON.stringify(response));
  })

  const timelySendData = setInterval(() => {
    db.getAllHostData().then((response) => {
      ws.send(JSON.stringify(response));
    });
  }, 45000);

  // When connection closes, GC the Timeout object.
  ws.on("close", () => {
    clearInterval(timelySendData);
  });
});
