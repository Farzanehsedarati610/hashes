require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());

const API_KEY = "JJ9PmjpWLeyVBFqXJXhy0RzswXmVucmaSfYv6jACF40=";  // Your API Key

// In-memory balance tracking (for transactions only)
const balances = new Map(); 

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

    // Ensure balance is initialized per hash (default: 5M)
    if (!balances.has(hash)) {
        balances.set(hash, 5000000);
    }

    // Deduct balance dynamically
    const currentBalance = balances.get(hash);
    if (currentBalance >= amount) {
        balances.set(hash, currentBalance - amount);
        res.json({ success: true, message: `Transfer of ${amount} USD completed for ${hash}. New Balance: ${balances.get(hash)} USD` });
    } else {
        res.status(400).json({ error: "Insufficient balance for transfer" });
    }
});

// Endpoint to check balances dynamically
app.get("/api/balances", (req, res) => {
    res.json(Object.fromEntries(balances));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

