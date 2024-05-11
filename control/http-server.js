require("dotenv").config({path : "../.env"}); 
const express = require("express");
const db = require("../model/mongo");
const path = require("path");
const WebSocket = require("ws");
const app = express();

app.use(express.json());

app.use(
  "/bootstrap",
  express.static(path.join(__dirname, "..", "node_modules/bootstrap/dist"))
);
app.use(express.static(path.join(__dirname, "..", "public")));

const server = app.listen(process.env.HTTP_PORT, () => {
  console.log(
    "---------------------------------------------------------------------"
  );
  console.log(
    `${new Date().toLocaleString()} : HTTP and WS Server is running on localhost:3000`
  );
  console.log(
    "---------------------------------------------------------------------"
  );
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "view/index.html"));
});

const wss = new WebSocket.Server({ server: server });

// WebSocket connection event
wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  db.queryAllMapStatuses().then((mapStatuses) => {
    ws.send(JSON.stringify(mapStatuses));
  });

  const refreshData = setInterval(() => {
    db.queryAllMapStatuses().then((mapStatuses) => {
      ws.send(JSON.stringify(mapStatuses));
    });
  }, 15000);

  // WebSocket message event
  ws.on("message", (message) => {
    console.log("Received: ", message.toString());

    // Echo back the received message
    ws.send(`Echo: ${message}`);
  });

  // WebSocket close event
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    clearInterval(refreshData);
  });
});