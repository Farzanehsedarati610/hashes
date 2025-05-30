require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY || "JJ9PmjpWLeyVBFqXJXhy0RzswXmVucmaSfYv6jACF40="; // Ensure it's loaded

// Middleware to validate API key
app.use((req, res, next) => {
  const clientKey = req.headers["authorization"]?.split("Bearer ")[1];
  if (!clientKey || clientKey !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized - Invalid API Key" });
  }
  next();
});

// Transfer Route Example
app.get("/api/auth-test", (req, res) => {
  res.json({ success: true, message: "API authentication is working!" });
});

app.post("/api/transfer", (req, res) => {
  const { hash, amount, routing_number, account_number } = req.body;

  if (!hash || !amount || !routing_number || !account_number) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  res.json({ success: true, message: `Transfer of ${amount} USD initiated for ${hash}` });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

