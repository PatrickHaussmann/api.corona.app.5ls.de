const axios = require("axios");
const neatCsv = require("neat-csv");

module.exports = async (req, res) => {
    const response = await axios.get(
        "https://covid.ourworldindata.org/data/latest/owid-covid-latest.csv"
    );

    const parsedData = await neatCsv(response.data);

    result = {
        countries: {},
    };

    parsedData.forEach((element) => {
        const key = element["iso_code"];
        if (result.countries[key]) return;

        result.countries[key] = {
            location: element["location"],
            continent: element["continent"],
            population: parseFloat(element["population"]),
            date: new Date(element["date"]),
            total_cases: parseFloat(element["total_cases"]),
            new_cases: parseFloat(element["new_cases"]),
            new_cases_smoothed: parseFloat(element["new_cases_smoothed"]),
            total_deaths: parseFloat(element["total_deaths"]),
            new_deaths: parseFloat(element["new_deaths"]),
            new_deaths_smoothed: parseFloat(element["new_deaths_smoothed"]),
            total_cases_per_million: parseFloat(
                element["total_cases_per_million"]
            ),
            new_cases_per_million: parseFloat(element["new_cases_per_million"]),
            new_cases_smoothed_per_million: parseFloat(
                element["new_cases_smoothed_per_million"]
            ),
            total_deaths_per_million: parseFloat(
                element["total_deaths_per_million"]
            ),
            new_deaths_per_million: parseFloat(
                element["new_deaths_per_million"]
            ),
            new_deaths_smoothed_per_million: parseFloat(
                element["new_deaths_smoothed_per_million"]
            ),
        };

        if (result.countries[key].new_cases_smoothed_per_million != null)
            result.countries[key].weekIncidence =
                (result.countries[key].new_cases_smoothed_per_million * 7) / 10;
        if (result.countries[key].total_cases_per_million != null)
            result.countries[key].casesRate =
                result.countries[key].total_cases_per_million / 1000000;
        if (
            result.countries[key].total_cases != null &&
            result.countries[key].total_deaths != null
        )
            result.countries[key].deathRate =
                result.countries[key].total_deaths /
                result.countries[key].total_cases;
    });

    res.json(result.countries);
};
