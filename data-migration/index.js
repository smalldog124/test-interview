import fs from "fs/promises";
import path from "path";
import poolClient from "./db-connection/pg.js";
import mongoClient from "./db-connection/mongo.js";
const collectionName = "products";

const main = async () => {
  const batchSize = 1000;
  await mongoClient.connect();
  const MGclient = await mongoClient.db("my_database");
  const mongoConnect = await MGclient.collection(collectionName);
  const totalProducts = await mongoConnect.countDocuments();
  for (let i = 1; i < totalProducts; i += batchSize) {
    const product = await getProducts(i, batchSize);
    await insertProduct(product);
  }
  await mongoClient.close();
  await poolClient.end();
  return;
  async function insertProduct(product) {
    if (product.length === 0) {
      console.log("⚠️ No products to insert.");
      return;
    }
    const client = await poolClient.connect();
    for (const p of product) {
      const value = [
        p._id,
        p.name,
        p.price,
        p.stock,
        p.category,
        JSON.stringify(p.attributes),
        p.created_at,
      ];
      try {
        await client.query("BEGIN");
        const query = `
            INSERT INTO products (id, name, price, stock, category, attributes, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO NOTHING
          `;
        const result = await client.query(query, value);
        if (result.rowCount === 0) {
          console.log("⚠️ Product already exists:", p._id);
          writeLogFile("existing_products.json", p);
        } else {
          console.log("✅ Product inserted:", p._id);
        }
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ Error occurred:", err.message);
        writeLogFile("errored_products.json", p);
      }
    }
    client.release();
  }
  async function getProducts(page, pageSize) {
    try {
      const skip = (page - 1) * pageSize;
      const products = await mongoConnect
        .find({})
        .skip(skip)
        .limit(pageSize)
        .toArray();
      return products;
    } catch (err) {
      console.error("❌ Error occurred:", err.message);
    }
  }
  async function writeLogFile(filename, product) {
    const filepath = path.resolve(filename);
    let data = [];
    try {
      const existing = await fs.readFile(filepath, "utf8");
      data = JSON.parse(existing);
    } catch {
      data = [];
    }
    data.push({ id: product._id, name: product.name });
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  }
};
main();
