const axios = require("axios");
const parse = require('csv-parse/lib/sync')

module.exports = async (req, res) => {

    const confirmed_promise = axios.get("https://cdn.jsdelivr.net/gh/CSSEGISandData/COVID-19@latest/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv");
    const recovered_promise = axios.get("https://cdn.jsdelivr.net/gh/CSSEGISandData/COVID-19@latest/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv");
    const deaths_promise = axios.get("https://cdn.jsdelivr.net/gh/CSSEGISandData/COVID-19@latest/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv");

    const [confirmed_response, recovered_response, deaths_response] = await Promise.all([confirmed_promise, recovered_promise, deaths_promise]);

    let options = { columns: true, skip_empty_lines: true }

    const confirmed_apidata = parse(confirmed_response.data, options)
    const recovered_apidata = parse(recovered_response.data, options)
    const deaths_apidata = parse(deaths_response.data, options)

    var confirmed, recovered, deaths

    function filterGermany(row) {
        if (row["Country/Region"] == "Germany") return true
        return false
    }

    var confirmed = confirmed_apidata.filter(filterGermany)[0];
    var recovered = recovered_apidata.filter(filterGermany)[0];
    var deaths = deaths_apidata.filter(filterGermany)[0];

    var lat = Number(confirmed.Lat), lon = Number(confirmed.Long)

    var timeline = []
    var dates = {}

    for (const date in confirmed) {
        if (confirmed.hasOwnProperty(date) && !["Province/State", "Country/Region", "Lat", "Long"].includes(date)) {
            dates[date] = { date: new Date(date).toLocaleString('de-DE', { day: "2-digit", month: "2-digit", year: "numeric" }) }
            dates[date].confirmed = Number(confirmed[date])
        }
    }

    for (const date in recovered) {
        if (recovered.hasOwnProperty(date) && !["Province/State", "Country/Region", "Lat", "Long"].includes(date)) {
            dates[date].recovered = Number(recovered[date])
        }
    }

    for (const date in deaths) {
        if (deaths.hasOwnProperty(date) && !["Province/State", "Country/Region", "Lat", "Long"].includes(date)) {
            dates[date].deaths = Number(deaths[date])
        }
    }

    let previous_confirmed = 0
    for (const date in dates) {
        if (dates.hasOwnProperty(date)) {
            const element = dates[date];
            element.active = element.confirmed - element.recovered - element.deaths
            element.diff = element.confirmed - previous_confirmed;

            timeline.push(element)
            previous_confirmed = element.confirmed;
        }
    }

    res.json({
        timeline,
        "country": "Germany",
        "country_code": "DE",
        lat,
        lon
    })
}

