require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 10000;
const apiKey = process.env.GATEWAY_SECRET_KEY;

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
    res.json({ hash, balance: getBalance(hash).toString() + " USD" });
});

// **Retrieve transaction history for a hash**
app.get('/transactions/:hash', (req, res) => {
    const hash = req.params.hash;
    res.json({ hash, history: transactionHistory[hash] || [] });
});

// **Transfer with balance deduction & transaction logging**
app.post('/transfer', (req, res) => {
    const { fromHash, routingNumber, toAccount, amount } = req.body;

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

