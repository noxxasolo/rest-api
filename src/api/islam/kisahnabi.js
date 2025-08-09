const fetch = require('node-fetch');

module.exports = function(app) {
    app.get('/muslim/kisahnabi', async (req, res) => {
        try {
            const nabi = req.query.nabi;

            // Ambil data dari GitHub
            const response = await fetch(`https://raw.githubusercontent.com/Zhirrr/My-SQL-Results/main/data/dataKisahNabi.json`);
            const data = await response.json();

            // Kalau ada query nabi, filter datanya
            let result = data;
            if (nabi) {
                const found = data.find(item => item.name.toLowerCase() === nabi.toLowerCase());
                if (!found) {
                    return res.json({ status: false, message: 'Nama nabi tidak ditemukan' });
                }
                result = found;
            }

            res.json({
                creator: creator,
                result
            });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ status: false, error: error.message });
        }
    });
};