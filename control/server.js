const express = require("express");
const db = require("../model/mongo");
const path = require("path");
const app = express();
let date = new Date();

app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/bootstrap", express.static(path.join(__dirname, "..", "node_modules/bootstrap/dist")));

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
  res.sendFile(path.join(__dirname, "..", "view/index.html"));
});

