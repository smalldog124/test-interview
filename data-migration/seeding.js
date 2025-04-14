import { MongoClient } from "mongodb";

const uri = "mongodb://root:example@localhost:27017/?authSource=admin";
const dbName = "my_database";
const collectionName = "products";

async function seedMongoDB() {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    await collection.deleteMany({});

    const sampleData = [
      {
        _id: "12345",
        name: "Laptop",
        price: 999.99,
        stock: 50,
        category: "Electronics",
        attributes: { brand: "TechBrand", color: "Silver" },
        created_at: new Date("2023-10-01T10:00:00Z"),
      },
      {
        _id: "12346",
        name: "Smartphone",
        price: 599.99,
        stock: 100,
        category: "Electronics",
        attributes: { brand: "PhoneCorp", color: "Black", storage: "128GB" },
        created_at: new Date("2023-10-05T12:00:00Z"),
      },
      {
        _id: "12347",
        name: "Bluetooth Speaker",
        price: 149.99,
        stock: 200,
        category: "Audio",
        attributes: { brand: "SoundBlast", color: "Blue", waterproof: "Yes" },
        created_at: new Date("2023-10-10T15:30:00Z"),
      },
    ];

    const result = await collection.insertMany(sampleData);
    console.log(`${result.insertedCount} documents were inserted`);
  } catch (error) {
    console.error("Error seeding MongoDB:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}
seedMongoDB()
  .then(() => console.log("Seeding completed"))
  .catch((error) => console.error("Error during seeding:", error));
