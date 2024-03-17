const express = require("express");
const db = require("./mongo");
const ws = require("ws");
const app = express();
let date = new Date();

app.use(express.json());

app.listen(3000, () => {
  console.log(
    "---------------------------------------------------------------------"
  );
  console.log(
    `${(date =
      new Date().toLocaleString())} : Server is running on http://localhost:3000/`
  );
  console.log(
    "---------------------------------------------------------------------"
  );
});

app.post("/post-map-data", (req, res) => {
  db.insertMapStatus(req.body);
  res.json(true);
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
  res.sendFile(__dirname + "/index.html");
});
