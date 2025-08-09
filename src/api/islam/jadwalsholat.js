const fetch = require('node-fetch');

module.exports = function(app) {
    app.get('/muslim/jadwalshalat', async (req, res) => {
        try {
            const kota = req.query.kota;

            if (!kota) {
                return res.json({ status: false, creator: creator, message: "masukan parameter kota" });
            }

            // Contoh: data untuk Maret 2021
            const response = await fetch(`https://raw.githubusercontent.com/Zhirrr/Zhirrr-Database/main/adzan/${kota}/2021/03.json`);
            const data = await response.json();

            res.json({
                creator: creator,
                result: data
            });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ status: false, error: error.message });
        }
    });
};