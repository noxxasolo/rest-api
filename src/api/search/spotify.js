const axios = require("axios");
const cheerio = require("cheerio");

async function SpotifySearchNoToken(search) {
    return new Promise(async (resolve, reject) => {
        try {
            const url = `https://open.spotify.com/search/${encodeURIComponent(search)}`;
            const { data } = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            });

            const $ = cheerio.load(data);
            const scriptData = $("#__NEXT_DATA__").html();

            if (!scriptData) return resolve({ mess: "Tidak ada data ditemukan" });

            const jsonData = JSON.parse(scriptData);
            const searchData = jsonData.props?.pageProps?.state?.searchPage || {};

            const hasil = [];

            // ===== TRACKS =====
            const tracks = searchData.tracks?.items || [];
            tracks.forEach(t => {
                hasil.push({
                    type: "track",
                    name: t.data.name,
                    artist: t.data.artists.items.map(a => a.profile.name).join(", "),
                    album: t.data.albumOfTrack?.name || null,
                    img: t.data.albumOfTrack?.coverArt?.sources?.[0]?.url || null,
                    link: `https://open.spotify.com/track/${t.data.uri.split(":").pop()}`
                });
            });

            // ===== ARTISTS =====
            const artists = searchData.artists?.items || [];
            artists.forEach(a => {
                hasil.push({
                    type: "artist",
                    name: a.data.profile.name,
                    img: a.data.visuals?.avatarImage?.sources?.[0]?.url || null,
                    link: `https://open.spotify.com/artist/${a.data.uri.split(":").pop()}`
                });
            });

            // ===== ALBUMS =====
            const albums = searchData.albums?.items || [];
            albums.forEach(a => {
                hasil.push({
                    type: "album",
                    name: a.data.name,
                    artist: a.data.artists.items.map(ar => ar.profile.name).join(", "),
                    img: a.data.coverArt?.sources?.[0]?.url || null,
                    link: `https://open.spotify.com/album/${a.data.uri.split(":").pop()}`
                });
            });

            // ===== PLAYLISTS =====
            const playlists = searchData.playlists?.items || [];
            playlists.forEach(p => {
                hasil.push({
                    type: "playlist",
                    name: p.data.name,
                    owner: p.data.owner?.name || null,
                    img: p.data.images?.items?.[0]?.sources?.[0]?.url || null,
                    link: `https://open.spotify.com/playlist/${p.data.uri.split(":").pop()}`
                });
            });

            if (hasil.length === 0) return resolve({ mess: "Tidak ada hasil yang ditemukan" });

            resolve(hasil.slice(0, 10)); // batasi max 10 item campuran

        } catch (err) {
            reject(err);
        }
    });
}

module.exports = function (app) {
    app.get("/search/spotify", async (req, res) => {
        const { q } = req.query;
        try {
            const results = await SpotifySearchNoToken(q);
            res.status(200).json({
                status: true,
                result: results
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};