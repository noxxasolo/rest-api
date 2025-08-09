const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
require("./function.js")

const app = express();
const PORT = process.env.PORT || 3000;

// Inisialisasi global variable
global.totalreq = 0;

app.enable("trust proxy");
app.set("json spaces", 2);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

const settingsPath = path.join(__dirname, './src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
global.apikey = settings.apiSettings.apikey;
global.creator = settings.apiSettings.creator; // biar bisa dipakai di semua route

app.use((req, res, next) => {
    console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Request Route: ${req.path} `));
    global.totalreq += 1;

    const originalJson = res.json;
    res.json = function (data) {
        if (data && typeof data === 'object') {
            const responseData = {
                status: data.status ?? true,
                creator: settings.apiSettings.creator || "Created Using Skyzo",
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
                try {
                    require(filePath)(app);
                    totalRoutes++;
                    console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Loaded Route: ${path.basename(file)} `));
                } catch (err) {
                    console.error(chalk.red(` Error loading route ${file}: ${err.message}`));
                }
            }
        });
    }
});
console.log(chalk.bgHex('#90EE90').hex('#333').bold(' Load Complete! ✓ '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Total Routes Loaded: ${totalRoutes} `));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

// 404 Handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'api-page', '404.html'));
});

// 500 Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(path.join(__dirname, 'api-page', '500.html'));
});

app.listen(PORT, () => {
    console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server is running on port ${PORT} `));
});

module.exports = app;
