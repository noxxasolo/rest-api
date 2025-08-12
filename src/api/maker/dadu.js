module.exports = function(app) {
    app.get('/maker/dadu', async (req, res) => {
        const fs = require('fs');
        const fetch = require('node-fetch');
        const path = require('path');

        const __path = process.cwd(); // sesuaikan jika berbeda

        try {
            const random = Math.floor(Math.random() * 6) + 1;
            const hasil = `https://www.random.org/dice/dice${random}.png`;

            const data = await fetch(hasil).then(v => v.buffer());
            const filePath = path.join(__path, '/tmp/dadu.png');

            fs.writeFileSync(filePath, data);
            res.sendFile(filePath);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};