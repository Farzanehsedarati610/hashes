const express = require('express');
const app = express();
app.use(express.json());

function computeBalance(hash) {
    const numericValue = BigInt("0x" + hash.substring(0, 30));
    return (numericValue % BigInt(10 ** 30)).toString() + " USD"; // Infinite scaling
}

app.post('/gateway/transfer', (req, res) => {
    const { account_number, routing_number, transactions } = req.body;
    
    const processedTransactions = transactions.map(tx => ({
        account: account_number,
        routing: routing_number,
        hash: tx.hash,
        computed_balance: computeBalance(tx.hash),
        status: "Transfer Pending"
    }));

    res.json({ status: "Gateway Initialized", transactions: processedTransactions });
});

app.listen(8080, () => console.log("Transaction Gateway is live"));

