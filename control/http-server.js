const express = require("express");
const db = require("../model/mongo");
const path = require("path");
const WebSocket = require("ws");
const wss2 = require("./ws-server");
const app = express();
let date = new Date();


wss2.createWSS();

app.use(express.json());

app.use(
  "/bootstrap",
  express.static(path.join(__dirname, "..", "node_modules/bootstrap/dist"))
);
app.use(express.static(path.join(__dirname, "..", "public")));

const server = app.listen(3000, () => {
  console.log(
    "---------------------------------------------------------------------"
  );
  console.log(
    `${(date =
      new Date().toLocaleString())} : HTTP and WS Server is running on localhost:3000`
  );
  console.log(
    "---------------------------------------------------------------------"
  );
});

app.get("/get-map-data", (req, res) => {
  const osNameParam = Object.keys(req.query)[0];
  console.log(
    "---------------------------------------------------------------------"
  );
  console.log(
    `${(date =
      new Date().toLocaleString())} : Obtained GET Request from: ${osNameParam}`
  );
  console.log(
    "---------------------------------------------------------------------"
  );
  db.queryMapStatus(osNameParam).then((dbMapStatus) => {
    res.json(dbMapStatus);
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "view/index.html"));
});

const wss = new WebSocket.Server({ server: server });

// WebSocket connection event
wss.on("connection", (ws) => {
  console.log("WebSocket client connected");
  db.queryAll().then((mapStatuses) => {
    ws.send(JSON.stringify(mapStatuses));
  });

  app.post("/post-map-data", (req, res) => {
    db.insertMapStatus(req.body);
    res.json(true);
    db.queryAll().then((mapStatuses) => {
      ws.send(JSON.stringify(mapStatuses));
    });
  });

  // WebSocket message event
  ws.on("message", (message) => {
    console.log("Received: ", message.toString());

    // Echo back the received message
    ws.send(`Echo: ${message}`);
  });

  // WebSocket close event
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});
