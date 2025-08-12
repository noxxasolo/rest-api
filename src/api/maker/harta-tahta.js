module.exports = function(app) {
    app.get('/maker/harta-tahta', async (req, res) => {
        const fs = require('fs');
        const fetch = require('node-fetch');
        const path = require('path');

        const __path = process.cwd(); // sesuaikan kalau beda
        const text = req.query.text;

        if (!text) {
            return res.status(400).json({
                status: false,
                message: 'Parameter text wajib diisi!'
            });
        }

        try {
            const hasil = `https://api.zeks.xyz/api/hartatahta?text=${encodeURIComponent(text)}&apikey=apivinz`;
            const data = await fetch(hasil).then(v => v.buffer());
            const filePath = path.join(__path, '/tmp/tahta.jpg');

            fs.writeFileSync(filePath, data);
            res.sendFile(filePath);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};