import { MongoClient } from "mongodb";
const uri = 'mongodb://root:example@localhost:27017/?authSource=admin';
// const uri = "mongodb://localhost:27017";
const dbName = "my_database";

const mongoClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default mongoClient;
