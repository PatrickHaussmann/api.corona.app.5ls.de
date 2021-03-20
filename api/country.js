const axios = require("axios");

module.exports = async (req, res) => {
    const cases_promise = axios.get("https://api.corona-zahlen.org/germany");
    const vaccinations_promise = axios.get(
        "https://api.corona-zahlen.org/vaccinations"
    );

    const [cases_response, vaccinations_response] = await Promise.all([
        cases_promise,
        vaccinations_promise,
    ]);

    const cases = cases_response.data;
    const vaccinations = vaccinations_response.data.data;
    let result = cases;
    result.rValue = result.r.value;
    result.r.value = undefined;

    result.vaccinations = vaccinations;
    result.vaccinations.states = undefined;
    result.vaccinations.indication = undefined;
    result.vaccinations.lastUpdate = vaccinations_response.data.meta.lastUpdate;

    result.lastUpdate = result.meta.lastUpdate;
    result.lastCheckedForUpdate = new Date();
    result.meta = undefined;
    res.json(result);
};
