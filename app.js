import express from "express";
import "dotenv/config";
import { pool } from "./db.js";

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.post("/api/products", async (req, res) => {
  const { name, price } = req.body;

  // Validation
  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" });
  }

  if (price <= 0) {
    return res.status(400).json({ error: "Price must be positive" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *",
      [name, price],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.put("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;

  // Validation
  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" });
  }

  if (price <= 0) {
    return res.status(400).json({ error: "Price must be positive" });
  }

  try {
    const result = await pool.query(
      "UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING *",
      [name, price, id],
    );

    // Check if product exists
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id],
    );

    // Check if product exists
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.listen(port, () => console.log(`App listening on port ${port}`));
