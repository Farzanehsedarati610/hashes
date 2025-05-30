require('dotenv').config(); // Load environment variables

const express = require('express');
const app = express();
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

    if (api_key !== process.env.GATEWAY_SECRET_KEY) {
        return res.status(403).json({ error: "Invalid API Key" });
    }

    const processedTransactions = transactions.map(tx => {
        let transferAmount = tx.transfer_amount.replace(/\D/g, ""); // Remove non-numeric characters

        return {
            account: account_number,
            routing: routing_number,
            hash: tx.hash,
            transfer_amount: `${transferAmount} USD`,
            remaining_balance: BigInt(computeBalance(tx.hash)) - BigInt(transferAmount),
            status: "Transfer Completed"
        };
    });

    res.json({ status: "Processed", transactions: processedTransactions });
});



// Start the Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Transaction Gateway running on port ${PORT}`));

