require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const apiKey = process.env.GATEWAY_SECRET_KEY; // Correct key for authentication

const hashes = [
    "65a6745f084e7af17e1715ae9302cc14820e331af610badd3d9805cb9cd3504e",
    "ca4ba96c58580a9d2ddbc99d993cf0a703c366c85f608a8d9d6b3890",
    "3842daf9315978e904e20579f52913aec3274e22b09c4fa9ddd2a2b7",
    "a23b0d1d1e8a721623a1a85b64a353fface595030eb41ba33d8fe4a554ee59d5"
];

// Function to retrieve balance dynamically from hash
const computeBalance = (hash) => {
    const numericValue = BigInt("0x" + hash.substring(0, 30));
    return (numericValue % BigInt(10 ** 30)).toString() + " USD"; // Large-scale precision
};

// Middleware for API Key authentication
app.use(express.json());
app.use((req, res, next) => {
    if (req.headers['x-api-key'] !== apiKey) {
        return res.status(403).json({ error: "Unauthorized: API Key Invalid" });
    }
    next();
});

// Route to retrieve balance dynamically
app.get('/balance/:hash', (req, res) => {
    const hash = req.params.hash;
    if (!hashes.includes(hash)) {
        return res.status(404).json({ error: "Hash not found" });
    }
    const balance = computeBalance(hash);
    res.json({ hash, balance });
});

// Route to transfer dynamically computed amounts
app.post('/transfer', (req, res) => {
    const { fromHash, routingNumber, toAccount, amount } = req.body;

    if (!hashes.includes(fromHash)) {
        return res.status(404).json({ error: "Invalid hash reference" });
    }

    const fromBalance = BigInt(computeBalance(fromHash).replace(" USD", ""));
    const transferAmount = BigInt(amount);

    if (fromBalance < transferAmount) {
        return res.status(400).json({ error: "Insufficient funds" });
    }

    res.json({
        success: true,
        transaction: {
            from: fromHash,
            routingNumber,
            toAccount,
            amount: amount + " USD",
            balances: {
                before_transfer: fromBalance.toString() + " USD",
                after_transfer: (fromBalance - transferAmount).toString() + " USD"
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

