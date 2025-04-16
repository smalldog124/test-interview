import { getAllProduct, reduceStock, getProductById } from "./repo.js";
import WebSocket from 'ws';
class ProductHandler {
  constructor(wss, db) {
      this.WebSocketServer = wss;
      this.DBConnection = db;
  }

  async getProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const products = await getAllProduct(this.DBConnection, page, pageSize);
      res.status(200).json(products);
    } catch (error) {
      console.log("❌ Error occurred:", error.message);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  async getProductById(req, res) {
    try {
      const productId = req.params.id;
      const product = await getProductById(this.DBConnection, productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(200).json(product);
    } catch (error) {
      console.log("❌ Error occurred:", error.message);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  }
  async reduceStock(req, res) {
    try {
      const { productId, quantity } = req.body;
      if (!productId || !quantity) {
        return res
          .status(400)
          .json({ error: "Product ID and quantity are required" });
      }
      const [updateStock, product] = await Promise.all([
        reduceStock(this.DBConnection, productId, quantity),
        getProductById(this.DBConnection, productId),
      ]);
      if (!updateStock) {
        return res
          .status(404)
          .json({ error: "Product not found or insufficient stock" });
      }
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      this.WebSocketServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({ data: product, action: "update_stock" })
          );
        }
      });
      res.status(200).json({ message: "Stock reduced successfully" });
    } catch (error) {
      console.log("❌ Error occurred:", error.message);
      res.status(500).json({ error: "Failed to reduce stock" });
    }
  }
}
export default ProductHandler;
