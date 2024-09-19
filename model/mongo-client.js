const { MongoClient } = require("mongodb");

const DB_IP = process.env.DB_IP;
const DB_PORT = process.env.DB_PORT;
const DB_NAME = process.env.DB_NAME;

const dbUri = `mongodb://${DB_IP}:${DB_PORT}`;
const db = createMongoClient();
const dbCollectionsPromise = getCollections(db);

// Asynchronously get database collection names.
function getCollections(db) {
  return db.listCollections().toArray();
}

// Create Mongo client connection.
function createMongoClient() {
  try {
    return new MongoClient(dbUri).db(DB_NAME);
  } catch (error) {
    console.log(error);
  }
}

// Aggregation pipeline that joins two collections and ignores same key value pairs.
function joinTwoCollections(firstCollection, secondCollection) {
  return db
    .collection(firstCollection).aggregate([
      {
        $lookup: {
          from: secondCollection,
          localField: "_id",
          foreignField: "_id",
          as: "recordFromSC",
        },
      },
      { 
        $project: {
        "recordFromSC.reqSuccess" : 0
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ["$recordFromSC", 0] }, "$$ROOT"],
          },
        },
      },
      { $project: { recordFromSC: 0 } },
      { $sort: {_id: 1}}
    ]).toArray();
}

// Obtain all the merged collections of client MAP data.
async function getAllSortedHostData() {
  try {
    const dbCollections = await dbCollectionsPromise;
    return joinTwoCollections(dbCollections[1].name, dbCollections[0].name);
  } catch (error) {
    console.error(error);
  }
}

module.exports = { getAllSortedHostData };
