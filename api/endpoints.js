const axios = require("axios");

module.exports = async (req, res) => {
    const responses = await Promise.all([
        axios.get("https://api.corona.app.5ls.de/states"),
        axios.get("https://api.corona.app.5ls.de/world"),
        axios.get("https://api.corona.app.5ls.de/history"),
        axios.get("https://api.corona.app.5ls.de/rValue"),
    ]);

    let result = [];

    responses.forEach((response) => {
        result.push({
            url: response.config.url,
            status: response.status,
            length: parseFloat(response.headers["content-length"]),
        });
    });
    
    res.json(result);
};
