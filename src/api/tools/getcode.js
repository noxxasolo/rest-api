const axios = require("axios");

module.exports = function(app) {
    app.get('/tools/getcode', async (req, res) => {
        try {
            const url = req.query.url;

            if (!url || !url.startsWith("http")) {
                return res.json({ status: false, message: "Masukkan parameter url yang valid, contoh: /tools/getcode?url=https://example.com" });
            }

            // Ambil source code HTML dari URL
            const response = await axios.get(url);
            const htmlContent = response.data;

            // Kirim file hasil download sebagai response
            res.setHeader('Content-Disposition', `attachment; filename="source-code.html"`);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.send(htmlContent);

        } catch (error) {
            console.error("Gagal ambil kode:", error.message);
            res.status(500).json({ status: false, message: "Gagal mengambil source code dari website." });
        }
    });
};