module.exports = function(app) {
    app.get('/maker/ttp', async (req, res) => {
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
            const data = await fetch(`https://api.areltiyan.site/sticker_maker?text=${encodeURIComponent(text)}`)
                .then(v => v.json());

            if (!data.base64) {
                return res.status(500).json({
                    status: false,
                    message: 'Gagal membuat TTP'
                });
            }

            const base64 = data.base64;
            const buffer = base64.slice(22); // hilangkan "data:image/png;base64,"
            const filePath = path.join(__path, '/tmp/ttp.png');

            fs.writeFileSync(filePath, buffer, 'base64');
            res.sendFile(filePath);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
