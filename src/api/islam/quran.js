const fetch = require('node-fetch');

module.exports = function(app) {
    app.get('/muslim/quran', async (req, res) => {
        try {
            const surah = req.query.surah;
            const ayat = req.query.ayat;

            if (!surah) {
                return res.json({ status: false, creator: creator, message: "masukan parameter surah" });
            }
            if (!ayat) {
                return res.json({ status: false, creator: creator, message: "masukan parameter ayat" });
            }

            const response = await fetch(`https://alquran-apiii.vercel.app/surah/${surah}/${ayat}`);
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