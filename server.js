const fs = require("fs");  // Add this at the top

// Your existing code below
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
app.post("/api/register", (req, res) => {
    const { hash } = req.body;

    if (!hash) {
        return res.status(400).json({ error: "Missing required field: 'hash' must be provided." });
    }

    // Initialize hash dynamically with an inferred balance
    if (!balances[hash]) {
        balances[hash] = calculateStartingBalance(hash);
    }

    res.json({ success: true, message: `Hash ${hash} registered successfully with balance ${balances[hash]} USD` });
});

// Example function to calculate dynamic starting balances per hash
function calculateStartingBalance(hash) {
    return parseInt(hash.substring(0, 8), 16); // Generates balance from hash data
}



// Transfer Route (Deduct Balance)
app.post("/api/transfer", (req, res) => {
    const { hash, amount, currency, routing_number, account_number } = req.body;

    if (!hash || !amount || !currency || !routing_number || !account_number) {
        return res.status(400).json({ error: "Missing required fields: Ensure 'hash', 'amount', 'currency', 'routing_number', and 'account_number' are included." });
    }

    // Execute transfer logic here
});

// Endpoint to check balances dynamically
app.get("/api/balances", (req, res) => {
    res.json(Object.fromEntries(balances));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

