const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
require("./function.js")

const app = express();
const PORT = process.env.PORT || 3000;

app.enable("trust proxy");
app.set("json spaces", 2);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

const settingsPath = path.join(__dirname, './src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
global.apikey = settings.apiSettings.apikey

app.use((req, res, next) => {
console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Request Route: ${req.path} `));
global.totalreq += 1
    const originalJson = res.json;
    res.json = function (data) {
        if (data && typeof data === 'object') {
            const responseData = {
                status: data.status,
                creator: settings.apiSettings.creator || "Created Using Galaxy",
                ...data
            };
            return originalJson.call(this, responseData);
        }
        return originalJson.call(this, data);
    };
    next();
});

// Api Route
let totalRoutes = 0;
const apiFolder = path.join(__dirname, './src/api');
fs.readdirSync(apiFolder).forEach((subfolder) => {
    const subfolderPath = path.join(apiFolder, subfolder);
    if (fs.statSync(subfolderPath).isDirectory()) {
        fs.readdirSync(subfolderPath).forEach((file) => {
            const filePath = path.join(subfolderPath, file);
            if (path.extname(file) === '.js') {
                require(filePath)(app);
                totalRoutes++;
                console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Loaded Route: ${path.basename(file)} `));
            }
        });
    }
});
console.log(chalk.bgHex('#90EE90').hex('#333').bold(' Load Complete! ✓ '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Total Routes Loaded: ${totalRoutes} `));

app.get('/api', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

// ... semua kode kamu di atas tetap sama

app.get('/games', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'games.html'));
});

// =================== Tambahan AI Asisten Galaxy ===================
const multer = require('multer');
const fetch = require('node-fetch');

// API Keys Groq
const apiKeys = [
    "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",
    "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",
    "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",
    "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"
];
function getRandomKey() {
    return apiKeys[Math.floor(Math.random() * apiKeys.length)];
}

// folder upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// halaman AI
app.get('/ai', (req, res) => {
    res.sendFile(path.join(__dirname, 'ai.html'));
});

// API tanya AI
app.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) return res.json({ status: false, message: "Pertanyaan tidak boleh kosong." });

        const apiKey = getRandomKey();
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [{ role: "user", content: question }]
            })
        });

        const data = await response.json();
        if (data.error) return res.json({ status: false, message: data.error.message });

        const answer = data.choices?.[0]?.message?.content || "Tidak ada jawaban.";
        res.json({ status: true, question, answer });
    } catch (err) {
        res.json({ status: false, message: err.message });
    }
});

// API upload file
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.json({ status: false, message: "Tidak ada file diupload." });
    res.json({ status: true, message: "File berhasil diupload!", file: `/uploads/${req.file.filename}` });
});
// =================== Akhir Tambahan ===================

app.use((req, res, next) => {
    res.status(404).sendFile(process.cwd() + "/api-page/404.html");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(process.cwd() + "/api-page/500.html");
});

app.listen(PORT, () => {
    console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server is running on port ${PORT} `));
});

module.exports = app;
