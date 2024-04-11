const { MongoClient } = require("mongodb");
const os = require("os");
let date = new Date();

const dbURI = "mongodb://localhost:27017"; // local uri for testing

let mapStatuses;
try {
  mapStatuses = new MongoClient(dbURI).db("MapStatusDB").collection("active");
} catch (error) {
  console.log(error);
}

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
  const hasOne = await mapStatuses.findOne({ _id: obj._id });
  if (hasOne) {
    const setDocument = { $set: {} };
    for (let key of Object.keys(obj)) {
      if (typeof obj[key] === "object") {
        for (let innerKey of Object.keys(obj[key])) {
          setDocument.$set[`${key}.${innerKey}`] = obj[key][innerKey];
        }
      } else {
        setDocument.$set[key] = obj[key];
      }
    }
    await mapStatuses.updateOne({ _id: obj._id }, setDocument);
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
  console.log(
    "---------------------------------------------------------------------"
  );
  console.log(
    `${(date = new Date().toLocaleString())} : Pulling entry in database...`
  );
  console.log(
    "---------------------------------------------------------------------"
  );

  try {
    return await mapStatuses.find().toArray();
  } catch (e) {
    console.error(e);
  }
}

module.exports = { insertMapStatus, queryMapStatus, queryAllMapStatuses };
