const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fetch = require('node-fetch');

// ====== Init Server ======
const app = express();
const PORT = process.env.PORT || 3000;

// Inisialisasi variabel global
global.totalreq = 0;

// Cek dan load function.js (jika ada)
try {
    require("./function.js");
} catch (err) {
    console.warn(chalk.bgRed.white(`Warning: Tidak bisa load function.js → ${err.message}`));
}

// Trust Proxy + Format JSON
app.enable("trust proxy");
app.set("json spaces", 2);

// Middleware dasar
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Static files
app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Load settings.json aman
const settingsPath = path.join(__dirname, './src/settings.json');
let settings = {};
try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
} catch (err) {
    console.error(chalk.bgRed.white(`Error: Tidak bisa membaca settings.json → ${err.message}`));
    settings.apiSettings = {};
}
global.apikey = settings.apiSettings?.apikey || "";

// Logging & Respon custom
app.use((req, res, next) => {
    console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Request Route: ${req.path} `));
    global.totalreq++;

    const originalJson = res.json;
    res.json = function (data) {
        if (data && typeof data === 'object') {
            const responseData = {
                status: data.status ?? true,
                creator: settings.apiSettings?.creator || "Created Using Galaxy",
                ...data
            };
            return originalJson.call(this, responseData);
        }
        return originalJson.call(this, data);
    };
    next();
});

// ====== Auto-load API Routes ======
let totalRoutes = 0;
const apiFolder = path.join(__dirname, './src/api');
if (fs.existsSync(apiFolder)) {
    fs.readdirSync(apiFolder).forEach((subfolder) => {
        const subfolderPath = path.join(apiFolder, subfolder);
        if (fs.statSync(subfolderPath).isDirectory()) {
            fs.readdirSync(subfolderPath).forEach((file) => {
                const filePath = path.join(subfolderPath, file);
                if (path.extname(file) === '.js') {
                    try {
                        require(filePath)(app);
                        totalRoutes++;
                        console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Loaded Route: ${path.basename(file)} `));
                    } catch (err) {
                        console.error(chalk.bgRed.white(`Error load route ${file}: ${err.message}`));
                    }
                }
            });
        }
    });
}
console.log(chalk.bgHex('#90EE90').hex('#333').bold(' Load Complete! ✓ '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Total Routes Loaded: ${totalRoutes} `));

// ====== Halaman ======
app.get('/api', (req, res) => res.sendFile(path.join(__dirname, 'api-page', 'index.html')));
app.get('/games', (req, res) => res.sendFile(path.join(__dirname, 'api-page', 'games.html')));
app.get('/ai', (req, res) => res.sendFile(path.join(__dirname, 'api-page', 'ai.html')));

// ====== AI Galaxy ======
const apiKeys = [
    "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",
    "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",
    "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",
    "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"
];
function getRandomKey() {
    return apiKeys[Math.floor(Math.random() * apiKeys.length)];
}

// ====== Upload File ======
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ====== API tanya AI ======
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

        const answer = data?.choices?.[0]?.message?.content || "Tidak ada jawaban.";
        res.json({ status: true, question, answer });
    } catch (err) {
        res.json({ status: false, message: err.message });
    }
});

// ====== API upload file ======
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.json({ status: false, message: "Tidak ada file diupload." });
    res.json({ status: true, message: "File berhasil diupload!", file: `/uploads/${req.file.filename}` });
});

// ====== Error Handler ======
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, "api-page", "404.html")));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(path.join(__dirname, "api-page", "500.html"));
});

// ====== Start Server ======
app.listen(PORT, () => {
    console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server is running on port ${PORT} `));
});

module.exports = app;
