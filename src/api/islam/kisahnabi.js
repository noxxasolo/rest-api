const fetch = require('node-fetch');
const settings = require('./settings.json'); // pastikan path-nya sesuai

module.exports = function(app) {
    app.get('/muslim/kisahnabi', async (req, res) => {
        try {
            const nabi = req.query.nabi;

            const response = await fetch(`https://raw.githubusercontent.com/Zhirrr/My-SQL-Results/main/data/dataKisahNabi.json`);
            const data = await response.json();

            let result = data;
            if (nabi) {
                const found = data.find(item => item.name.toLowerCase() === nabi.toLowerCase());
                if (!found) {
                    return res.json({ status: false, message: 'Nama nabi tidak ditemukan' });
                }
                result = found;
            }

            res.json({
                creator: settings.apiSettings.creator,
                result
            });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
