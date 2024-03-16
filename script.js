const express = require("express");
const ws = require("ws");
const app = express();

app.use(express.json());

app.listen(3000, function () {
  console.log("Server is running on localhost:3000/");
});

app.post("/post", (req, res) => {
  console.log(req.body);
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
