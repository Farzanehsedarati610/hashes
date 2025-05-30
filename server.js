const express = require('express');
const app = express();
const port = 8080;
const apiKey = process.env.API_KEY; // Securely stored in env variables

const hashes = [
    "65a6745f084e7af17e1715ae9302cc14820e331af610badd3d9805cb9cd3504e",
    "ca4ba96c58580a9d2ddbc99d993cf0a703c366c85f608a8d9d6b3890",
    "3842daf9315978e904e20579f52913aec3274e22b09c4fa9ddd2a2b7",
    "a23b0d1d1e8a721623a1a85b64a353fface595030eb41ba33d8fe4a554ee59d5",
    "dc5b25606dc0c977dec5aa13d61946b470066976aefcf390c40ffaff75d9a186",
    "8470faf251f8c3c8672718cbd982f942ce649bb69714794eb8b1de934cb59d52",
    "663e295cc4399e9a551571eebd7a4db0d6f3662c87eb18d0e0a2a4b67f07145c",
    "3fc8241058ee913bfe277e4652abc04822b33aa939d6f65084aae02e917eeff1",
    "d71d4b23cb2ec49e7b0ff31fd563b5ffdf4899dbecebd599711213ff37e52bd9",
    "c6f44160cdd0479af696b81abdd1982d36e08263322e4c5b07bf27b5623b29d5",
    "26efc86c0269a129bd183480f947c7424a48f9523156a8a70d3dfe5ed7103aab",
    "7c7228137410dc76b4925dfcc729fdc92cfd94a026022111c1a502d6240580fb"
];

// Function to dynamically compute balance from hash
const computeBalance = (hash) => {
    const numericValue = BigInt("0x" + hash.substring(0, 30));
    return (numericValue % BigInt(10 ** 30)).toString() + " USD"; // Scaled for large amounts
};

// Middleware for API Key authentication
app.use(express.json());
app.use((req, res, next) => {
    if (req.headers['x-api-key'] !== apiKey) {
        return res.status(403).json({ error: "Unauthorized" });
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
    const { fromHash, toHash, amount } = req.body;

    if (!hashes.includes(fromHash) || !hashes.includes(toHash)) {
        return res.status(404).json({ error: "Invalid hash reference" });
    }

    const fromBalance = BigInt(computeBalance(fromHash).replace(" USD", ""));
    const toBalance = BigInt(computeBalance(toHash).replace(" USD", ""));
    const transferAmount = BigInt(amount);

    if (fromBalance < transferAmount) {
        return res.status(400).json({ error: "Insufficient funds" });
    }

    res.json({
        success: true,
        transaction: {
            from: fromHash,
            to: toHash,
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

