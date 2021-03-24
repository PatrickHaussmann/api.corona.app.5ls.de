const axios = require("axios");

const population = 83783945;

module.exports = async (req, res) => {
    let time_start = Date.now();

    const cases_promise = axios.get(
        "https://api.corona-zahlen.org/germany/history/cases"
    );
    const deaths_promise = axios.get(
        "https://api.corona-zahlen.org/germany/history/deaths"
    );

    const [cases_response, deaths_response] = await Promise.all([
        cases_promise,
        deaths_promise,
    ]);

    let time_download = Date.now();

    const cases = cases_response.data.data;
    const deaths = deaths_response.data.data;

    let dates = {};

    cases.forEach((element) => {
        if (!dates[element.date]) dates[element.date] = {};
        dates[element.date].cases = element.cases;
    });
    deaths.forEach((element) => {
        if (!dates[element.date]) dates[element.date] = {};
        dates[element.date].deaths = element.deaths;
    });

    for (const date in dates) {
        if (Object.hasOwnProperty.call(dates, date)) {
            const element = dates[date];

            /* if (population != null && element.cases != null)
                element.casesRate = element.cases / population; */
            if (element.cases != null && element.deaths != null)
                element.deathRate = element.deaths / element.cases;
        }
    }

    let result = {
        data: [],
    };

    for (const key in dates) {
        if (dates.hasOwnProperty(key)) {
            dates[key].date = key;
            result.data.push(dates[key]);
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
    res.json(result);
};
