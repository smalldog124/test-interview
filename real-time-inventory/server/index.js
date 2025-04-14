import ProductHandler from "./product/handlers.js";
import express, { json, urlencoded } from "express";
import { WebSocketServer } from "ws";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import pgPool from "./db-connection/pg.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wss = new WebSocketServer({ port: 30001 });
wss.on("connection", (ws) => {
  console.log("WebSocket connection established");
  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
  });
});
console.log(`WebSocket server running at ws://localhost:30001`);
const productHandler = new ProductHandler(wss, pgPool);
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
app.get("/api/v1/product", (req, res) => {
  productHandler.getProducts(req, res);
});
app.post("/api/v1/product/reduce-stock", (req, res) => {
  productHandler.reduceStock(req, res);
});
app.use("/static", express.static(path.join(__dirname, "../web")));
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
