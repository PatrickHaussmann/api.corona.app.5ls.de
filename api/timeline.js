const axios = require("axios");

module.exports = async (req, res) => {

    let result = {}
    result.timeline = []

    const response = await axios.get("https://api.covid19api.com/dayone/country/germany");
    const apidata = response.data;

    result.country = apidata[0].Country
    result.country_code = apidata[0].CountryCode
    result.lat = apidata[0].Lat
    result.lon = apidata[0].Lon

    let confirmed = 0
    for (const element of apidata) {
        let simplified = {}
        simplified.date = element.Date;
        simplified.confirmed = element.Confirmed;
        simplified.deaths = element.Deaths;
        simplified.recovered = element.Recovered;
        simplified.active = element.Active;
        simplified.diff = simplified.confirmed - confirmed;

        confirmed = simplified.confirmed;

        result.timeline.push(simplified);
    }

    res.json(result)
}
