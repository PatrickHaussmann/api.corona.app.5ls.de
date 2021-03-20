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

            states[state].vaccinated = element.vaccinated;
            states[state].delta.vaccinated = element.delta;
            states[state].vaccinatedQuote = element.quote;
            states[state].secondVaccination =
                element.secondVaccination.vaccinated;
            states[state].delta.secondVaccination =
                element.secondVaccination.delta;
            states[state].secondVaccinationQuote =
                element.secondVaccination.quote;
        }
    }

    let result = {
        states: {},
    };

    for (const state in states) {
        if (Object.hasOwnProperty.call(states, state)) {
            const element = states[state];
            result.states[element.name] = element;
        }
    }

    result.lastUpdate = cases_response.data.meta.lastUpdate;
    result.lastCheckedForUpdate = new Date();
    result.lastUpdateVaccinations = vaccinations_response.data.meta.lastUpdate;
    res.json(result);
};
