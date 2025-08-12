module.exports = function(app) {
    app.get('/maker/skatch', async (req, res) => {
        const fs = require('fs');
        const fetch = require('node-fetch');
        const path = require('path');

        const __path = process.cwd();
        const url = req.query.url;

        if (!url) {
            return res.status(400).json({
                status: false,
                message: 'Parameter url wajib diisi!'
            });
        }

        try {
            const hasil = `https://lindow-api.herokuapp.com/api/sketcheffect?img=${encodeURIComponent(url)}&apikey=LindowApi`;
            const data = await fetch(hasil).then(v => v.buffer());
            const filePath = path.join(__path, '/tmp/skatch.jpeg');

            fs.writeFileSync(filePath, data);
            res.sendFile(filePath);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};