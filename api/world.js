const axios = require("axios");

module.exports = async (req, res) => {
    const response = await axios.get(
        "https://covid.ourworldindata.org/data/owid-covid-data.json"
    );
    const apidata = response.data;

    result = {
        countries: {},
    };

    for (const key in apidata) {
        if (Object.hasOwnProperty.call(apidata, key)) {
            const element = {};

            element.location = apidata[key].location;
            element.continent = apidata[key].continent;
            element.population = apidata[key].population;
            element.date = apidata[key].date;

            let data = apidata[key].data[apidata[key].data.length - 1];
            for (var key2 in data) {
                if (data.hasOwnProperty(key2)) {
                    element[key2] = data[key2];
                }
            }

            if (element.new_cases_smoothed_per_million != null)
                element.weekIncidence =
                    (element.new_cases_smoothed_per_million * 7) / 10;
            if (element.total_cases_per_million != null)
                element.casesRate = element.total_cases_per_million / 1000000;
            if (element.total_cases != null && element.total_deaths != null)
                element.deathRate = element.total_deaths / element.total_cases;

            result.countries[key] = element;
        }
    }

    res.json(result.countries);
};
