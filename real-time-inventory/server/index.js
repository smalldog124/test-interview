import pgPool from "./db-connection/pg.js";
import { getAllProduct, reduceStock, getProductById } from "./product/index.js";
import express, { json, urlencoded } from "express";
import { WebSocketServer } from "ws";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
app.use(json());
app.use(urlencoded({ extended: true }));
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
});

app.use("/api/", apiLimiter);
const wss = new WebSocketServer({ port: 30001 });
wss.on("connection", (ws) => {
  console.log("WebSocket connection established");
  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
  });
});

app.get("/api/v1/product", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  try {
    const products = await getAllProduct(pgPool, page, pageSize);
    if (!products) {
      return res.status(404).json({ error: "Products not found" });
    }
    res.status(200).json(products);
  } catch (err) {
    console.error("❌ Error occurred:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/api/v1/product/reduce-stock", async (req, res) => {
  console.log("req.body", req.body);
  const { productId, quantity } = req.body;
  if (!productId || !quantity) {
    return res
      .status(400)
      .json({ error: "Product ID and quantity are required" });
  }
  try {
    await reduceStock(pgPool, productId, quantity);
    const product = await getProductById(pgPool, productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    } else {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({ data: product, action: "update_stock" })
          );
        }
      });
    }
    res.status(200).json({ message: "Stock reduced successfully" });
  } catch (err) {
    console.error("❌ Error occurred:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
app.use("/static", express.static(path.join(__dirname, "../web")));
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
