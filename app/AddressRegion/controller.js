const fetchProvinsi = async (req, res) => {
    const fetch = (await import('node-fetch')).default;
    const targetUrl = 'https://wilayah.id/api/provinces.json';
    try {
        const response = await fetch(targetUrl);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching provinces from external API' });
    }
};

const fetchKabuaten = async (req, res) => {
    const fetch = (await import('node-fetch')).default;
    const { provinceCode } = req.params;
    const targetUrl = `https://wilayah.id/api/regencies/${provinceCode}.json`;
    try {
        const response = await fetch(targetUrl);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching regencies from external API' });
    }
};

const fetchKecamatan = async (req, res) => {
    const fetch = (await import('node-fetch')).default;
    const { regenciesCode } = req.params;
    const targetUrl = `https://wilayah.id/api/districts/${regenciesCode}.json`;

    try {
        const response = await fetch(targetUrl);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching regencies from external API' });
    }
};

const fetchKelurahan = async (req, res) => {
    const fetch = (await import('node-fetch')).default;
    const { districtsCode } = req.params;
    const targetUrl = `https://wilayah.id/api/villages/${districtsCode}.json`;

    try {
        const response = await fetch(targetUrl);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching regencies from external API' });
    }
};

module.exports = {
    fetchProvinsi,
    fetchKabuaten,
    fetchKecamatan,
    fetchKelurahan,
};