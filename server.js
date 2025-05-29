const express = require('express');
const dotenv = require('dotenv');
const app = express();

dotenv.config(); // Load environment variables
app.use(express.json()); // Enable JSON parsing

// Retrieve secure environment variables
const gatewaySecret = process.env.GATEWAY_SECRET_KEY;
const scalingFactor = BigInt(10 ** 30);
const logTransactions = process.env.LOG_TRANSACTIONS === "true";

// Function to compute scaled balance dynamically
function computeBalance(hash) {
    const numericValue = BigInt("0x" + hash.substring(0, 30));
    return (numericValue % scalingFactor).toString() + " USD"; // Scales infinitely
}

// API Endpoint for Processing Transactions
app.post('/gateway/transfer', (req, res) => {
    const { api_key, account_number, routing_number, transactions } = req.body;

    // Verify API Key
    if (api_key !== gatewaySecret) {
        return res.status(403).json({ error: "Invalid API Key" });
    }

    // Process Transactions & Scale Balances
    const processedTransactions = transactions.map(tx => ({
        account: account_number,
        routing: routing_number,
        hash: tx.hash,
        computed_balance: computeBalance(tx.hash),
        status: "Transfer Initiated"
    }));

    // Optional Logging
    if (logTransactions) {
        console.log("Transaction Log:", processedTransactions);
        console.log("Loaded API Key:", process.env.GATEWAY_SECRET_KEY);
        console.log("Scaling Factor:", process.env.MAX_SCALING_FACTOR);
        console.log("Logging Enabled:", process.env.LOG_TRANSACTIONS);

    }

    res.json({ status: "Processed", transactions: processedTransactions });
});

// Start the Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Transaction Gateway running on port ${PORT}`));

