module.exports = function(app) {
    app.get('/maker/tololserti', async (req, res) => {
        const fs = require('fs');
        const fetch = require('node-fetch');
        const path = require('path');

        const __path = process.cwd();
        const text = req.query.text;

        if (!text) {
            return res.status(400).json({
                status: false,
                message: 'Parameter text wajib diisi!'
            });
        }

        try {
            const hasil = `https://lolhuman.herokuapp.com/api/toloserti?apikey=muzharzain&name=${encodeURIComponent(text)}`;
            const data = await fetch(hasil).then(v => v.buffer());
            const filePath = path.join(__path, '/tmp/tololserti.jpeg');

            fs.writeFileSync(filePath, data);
            res.sendFile(filePath);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};