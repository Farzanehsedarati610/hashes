require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());

// Simulated balance tracking (should be in a DB in production)
const balances = {}; // Example storage: { "hash1": 5000000, "hash2": 2500000 }

const API_KEY = process.env.API_KEY || "JJ9PmjpWLeyVBFqXJXhy0RzswXmVucmaSfYv6jACF40=";

// Middleware to validate API key
app.use((req, res, next) => {
  const clientKey = req.headers["authorization"]?.split("Bearer ")[1];
  if (!clientKey || clientKey !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized - Invalid API Key" });
  }
  next();
});

// Transfer Route (Deduct Balance)
app.post("/api/transfer", (req, res) => {
  const { hash, amount, routing_number, account_number } = req.body;

  if (!hash || !amount || !routing_number || !account_number) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  // Default starting balance per hash
const DEFAULT_BALANCE = 5000000;

  // Deduct transfer amount
  if (balances[hash] >= amount) {
    balances[hash] -= amount;
    res.json({ success: true, message: `Transfer of ${amount} USD completed for ${hash}. New Balance: ${balances[hash]} USD` });
  } else {
    res.status(400).json({ error: "Insufficient balance for transfer" });
  }
});

// Endpoint to check updated balances
app.get("/api/balances", (req, res) => {
  res.json(balances);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

