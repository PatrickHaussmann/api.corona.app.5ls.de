const axios = require("axios");

module.exports = async (req, res) => {
    let time_start = Date.now();

    const cases_promise = axios.get("https://api.corona-zahlen.org/states");
    const vaccinations_promise = axios.get(
        "https://api.corona-zahlen.org/vaccinations"
    );

    const [cases_response, vaccinations_response] = await Promise.all([
        cases_promise,
        vaccinations_promise,
    ]);

    let time_download = Date.now();

    const cases = cases_response.data.data;
    const vaccinations = vaccinations_response.data.data.states;

    for (const key in cases) {
        if (Object.hasOwnProperty.call(cases, key)) {
            const state = cases[key];

            if (state.population != null && state.cases != null)
                state.casesRate = state.cases / state.population;
            if (state.cases != null && state.deaths != null)
                state.deathRate = state.deaths / state.cases;

            state.casesPer100k = undefined;
        }
    }

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

    let time_end = Date.now();

    let timing = {
        download: time_download - time_start,
        unpack: time_end - time_download,
    };
    console.log(timing);

    result.lastUpdate = cases_response.data.meta.lastUpdate;
    result.lastCheckedForUpdate = new Date();
    result.lastUpdateVaccinations = vaccinations_response.data.meta.lastUpdate;
    res.json(result);
};
