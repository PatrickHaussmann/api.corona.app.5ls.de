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

    let result = {};
    let states = cases;

    if (vaccinations_response.data.data) {
        result.lastUpdateVaccinations =
            vaccinations_response.data.meta.lastUpdate;
        const vaccinations = vaccinations_response.data.data.states;
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
    }

    for (const state in states) {
        if (Object.hasOwnProperty.call(states, state)) {
            const element = states[state];
            states[element.name] = element;
        }
    }
    result.states = states;

    result.lastUpdate = cases_response.data.meta.lastUpdate;
    result.lastCheckedForUpdate = new Date();
    res.json(result);
};
