const axios = require("axios");

module.exports = async (req, res) => {
    const response = await axios.get("https://api.corona-zahlen.org/states");
    let result = response.data;

    result.lastUpdate = result.meta.lastUpdate;
    result.lastCheckedForUpdate = new Date();
    result.meta = undefined;
    res.json(result);
};