const axios = require("axios");

module.exports = async (req, res) => {
    const cases_promise = axios.get(
        "https://api.corona-zahlen.org/germany/history/cases"
    );
    const incidence_promise = axios.get(
        "https://api.corona-zahlen.org/germany/history/incidence"
    );
    const deaths_promise = axios.get(
        "https://api.corona-zahlen.org/germany/history/deaths"
    );
    const recovered_promise = axios.get(
        "https://api.corona-zahlen.org/germany/history/recovered"
    );

    const [
        cases_response,
        incidence_response,
        deaths_response,
        recovered_response,
    ] = await Promise.all([
        cases_promise,
        incidence_promise,
        deaths_promise,
        recovered_promise,
    ]);

    const cases = cases_response.data.data;
    const incidence = incidence_response.data.data;
    const deaths = deaths_response.data.data;
    const recovered = recovered_response.data.data;

    let dates = {};

    cases.forEach((element) => {
        if (!dates[element.date]) dates[element.date] = {};
        dates[element.date].cases = element.cases;
    });
    incidence.forEach((element) => {
        if (!dates[element.date]) dates[element.date] = {};
        dates[element.date].weekIncidence = element.weekIncidence;
    });
    deaths.forEach((element) => {
        if (!dates[element.date]) dates[element.date] = {};
        dates[element.date].deaths = element.deaths;
    });
    recovered.forEach((element) => {
        if (!dates[element.date]) dates[element.date] = {};
        dates[element.date].recovered = element.recovered;
    });

    let result = {
        data: [],
    };

    for (const key in dates) {
        if (dates.hasOwnProperty(key)) {
            dates[key].date = key;
            result.data.push(dates[key]);
        }
    }

    result.lastUpdate = cases_response.data.meta.lastUpdate;
    result.lastCheckedForUpdate = new Date();
    res.json(result);
};
