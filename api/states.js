const axios = require("axios");

module.exports = async (req, res) => {
    const cases_promise = axios.get("https://api.corona-zahlen.org/states");
    const vaccinations_promise = axios.get(
        "https://api.corona-zahlen.org/vaccinations"
    );

    const [cases_response, vaccinations_response] = await Promise.all([
        cases_promise,
        vaccinations_promise,
    ]);

    const cases = cases_response.data.data;
    const vaccinations = vaccinations_response.data.data.states;

    let states = cases;

    for (const state in vaccinations) {
        if (
            Object.hasOwnProperty.call(vaccinations, state) &&
            state != "Bund"
        ) {
            const element = vaccinations[state];
            if (!states[state]) states[state] = {};
            element.name = undefined;
            states[state].vaccinations = element;
        }
    }

    let result = {
        states,
    };

    result.lastUpdate = cases_response.data.meta.lastUpdate;
    result.lastCheckedForUpdate = new Date();
    res.json(result);
};
