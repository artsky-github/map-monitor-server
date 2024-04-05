const { MongoClient } = require("mongodb");
const os = require("os");
let date = new Date();

const dbURI = "mongodb://localhost:27017"; // local uri for testing
const mapStatuses = new MongoClient(dbURI)
  .db("MapStatusDB")
  .collection("active");

async function insertMapStatus(obj) {
  console.log(
    "---------------------------------------------------------------------"
  );
  console.log(
    `${(date = new Date().toLocaleString())} : Inserting to the database...`
  );
  console.log(
    "---------------------------------------------------------------------"
  );
  const hasOne = await mapStatuses.findOne({ _id: os.hostname() });
  if (hasOne) {
    await mapStatuses.replaceOne({ _id: os.hostname() }, obj);
  } else {
    await mapStatuses.insertOne(obj);
  }
}

async function queryMapStatus(osName) {
  console.log(
    "---------------------------------------------------------------------"
  );
  console.log(
    `${(date = new Date().toLocaleString())} : Pulling entry in database...`
  );
  console.log(
    "---------------------------------------------------------------------"
  );
  return await mapStatuses.findOne({ _id: osName });
}

async function queryAllMapStatuses() {
  return await mapStatuses.find().toArray();
}

module.exports = { insertMapStatus, queryMapStatus, queryAllMapStatuses };
