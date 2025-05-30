require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const apiKey = process.env.GATEWAY_SECRET_KEY;

const hashes = [
    "65a6745f084e7af17e1715ae9302cc14820e331af610badd3d9805cb9cd3504e",
    "ca4ba96c58580a9d2ddbc99d993cf0a703c366c85f608a8d9d6b3890",
    "3842daf9315978e904e20579f52913aec3274e22b09c4fa9ddd2a2b7",
    "a23b0d1d1e8a721623a1a85b64a353fface595030eb41ba33d8fe4a554ee59d5"
];

// **Persistent balance storage**
const balanceStore = {};  
const transactionHistory = {};  // Stores logs of all transactions

const getBalance = (hash) => {
    if (!balanceStore[hash]) {
        balanceStore[hash] = BigInt("0x" + hash.substring(0, 30)) % BigInt(10 ** 30);
    }
    return balanceStore[hash];
};

// **Middleware for API authentication**
app.use(express.json());
app.use((req, res, next) => {
    if (req.headers['x-api-key'] !== apiKey) {
        return res.status(403).json({ error: "Unauthorized" });
    }
    next();
});

// **Retrieve balance (persistent)**
app.get('/balance/:hash', (req, res) => {
    const hash = req.params.hash;
    if (!hashes.includes(hash)) {
        return res.status(404).json({ error: "Hash not found" });
    }
    res.json({ hash, balance: getBalance(hash).toString() + " USD" });
});

// **Retrieve transaction history for a hash**
app.get('/transactions/:hash', (req, res) => {
    const hash = req.params.hash;
    if (!hashes.includes(hash)) {
        return res.status(404).json({ error: "Hash not found" });
    }
    res.json({ hash, history: transactionHistory[hash] || [] });
});

// **Transfer with balance deduction & transaction logging**
app.post('/transfer', (req, res) => {
    const { fromHash, routingNumber, toAccount, amount } = req.body;
    if (!hashes.includes(fromHash)) {
        return res.status(404).json({ error: "Invalid hash reference" });
    }

    let fromBalance = getBalance(fromHash);
    let transferAmount = BigInt(amount);

    if (fromBalance < transferAmount) {
        return res.status(400).json({ error: "Insufficient funds" });
    }

    // **Update balance persistently**
    balanceStore[fromHash] = fromBalance - transferAmount;

    // **Log transaction history**
    if (!transactionHistory[fromHash]) {
        transactionHistory[fromHash] = [];
    }
    transactionHistory[fromHash].push({
        timestamp: new Date().toISOString(),
        routingNumber,
        toAccount,
        amount: amount + " USD",
        before_transfer: fromBalance.toString() + " USD",
        after_transfer: balanceStore[fromHash].toString() + " USD"
    });

    res.json({
        success: true,
        transaction: {
            from: fromHash,
            routingNumber,
            toAccount,
            amount: amount + " USD",
            balances: {
                before_transfer: fromBalance.toString() + " USD",
                after_transfer: balanceStore[fromHash].toString() + " USD"
            }
        }
    });
});

app.listen(port, () => console.log(`Server running on port ${port}`));

