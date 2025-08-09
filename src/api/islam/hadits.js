const fetch = require('node-fetch');

module.exports = function(app) {
    app.get('/muslim/hadits', async (req, res) => {
        try {
            const kitab = req.query.kitab;
            const nomor = req.query.nomor;

            if (!kitab) {
                return res.json({ status: false, creator: creator, message: "masukan parameter kitab" });
            }
            if (!nomor) {
                return res.json({ status: false, creator: creator, message: "masukan parameter nomor" });
            }

            const response = await fetch(`https://hadits-api-zhirrr.vercel.app/books/${kitab}/${nomor}`);
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
