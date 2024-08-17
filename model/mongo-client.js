require("dotenv").config();
const { MongoClient } = require("mongodb");
const os = require("os");
let date = new Date();

const dbURI = `mongodb://${process.env.DB_IP}:${process.env.DB_PORT}`; // local uri for testing

let mapMonitorDB;
try {
  mapMonitorDB = new MongoClient(dbURI).db("MapMonitor");
} catch (error) {
  console.log(error);
}

// Aggregation pipeline that joins two collections and ignores same key value pairs.
function joinTwoCollections(firstCollection, secondCollection) {
  return mapMonitorDB
    .collection(firstCollection)
    .aggregate([
      {
        $lookup: {
          from: secondCollection,
          localField: "_id",
          foreignField: "_id",
          as: "recordFromSC",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ["$recordFromSC", 0] }, "$$ROOT"],
          },
        },
      },
      { $project: { recordFromSC: 0 } },
    ])
    .toArray();
}

// Obtain all the
function getAllHostData() {
  try {
    return joinTwoCollections("counts", "statuses");
  } catch (error) {
    console.error(error);
  }
}

module.exports = { getAllHostData };
