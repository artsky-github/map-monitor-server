const express = require("express");
const db = require("./map-status-db");
const ws = require("ws");
const app = express();

app.use(express.json());

app.listen(3000, function () {
  console.log("Server is running on localhost:3000/");
});

app.post("/post-data", (req, res) => {
  db.insertMapStatus(req.body);
  res.json(true);
});

app.get("/data", (req, res) => {
  const osNameParam = Object.keys(req.query)[0];
  console.log(osNameParam);
  db.getMapStatus(osNameParam).then((dbMapStatus) => {
    res.json(dbMapStatus);
  });
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

//app.get("/map-data", function (req, res) {});
