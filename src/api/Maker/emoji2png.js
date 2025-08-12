module.exports = function(app) {
    app.get('/maker/emoji2png', async (req, res) => {
        const emoji = require('emoji-api')(); // pastikan sudah install dan require dengan benar
        const creator = 'YourNameOrBot'; // ganti dengan nama pembuat / creator sesuai kebutuhan
        const Emoji = req.query.text;

        if (!Emoji) {
            return res.status(400).json({
                status: false,
                message: 'Parameter text wajib diisi!'
            });
        }

        try {
            const img_emoji = await emoji.get(Emoji);
            if (!img_emoji || !img_emoji.images || !img_emoji.images[0]) {
                return res.status(404).json({
                    status: false,
                    message: 'Emoji tidak ditemukan'
                });
            }

            const result = {
                status: true,
                code: 200,
                creator: `${creator}`,
                result: img_emoji.images[0].url
            };
            res.json(result);
        } catch (err) {
            res.status(500).json({
                status: false,
                message: 'Terjadi kesalahan saat mengambil emoji'
            });
        }
    });
};