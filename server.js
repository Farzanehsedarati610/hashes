const express = require('express');
const app = express();
app.use(express.json());

function computeBalance(hash) {
    const numericValue = BigInt("0x" + hash.substring(0, 30));
    const scaledBalance = numericValue % BigInt(10 ** 30);
    return scaledBalance.toString() + " USD";
}

app.post('/transfer', (req, res) => {
    const { transactions } = req.body;
    const processedTransactions = transactions.map(tx => ({
        hash: tx.hash,
        computed_balance: computeBalance(tx.hash)
    }));

    res.json({ status: "Processed", transactions: processedTransactions });
});

app.listen(8080, () => console.log("Transfer API running on port 8080"));

