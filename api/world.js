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
            const element = apidata[key];

            let data = element.data[element.data.length - 1];
            for (var key2 in data) {
                if (data.hasOwnProperty(key2)) {
                    element[key2] = data[key2];
                }
            }

            element.data = undefined;
            result.countries[key] = element;
        }
    }

    res.json(result.countries);
};
