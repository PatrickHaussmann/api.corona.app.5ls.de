const axios = require("axios");

module.exports = async (req, res) => {

    let districts = [];

    const response = await axios.get("https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=GEN,EWZ,county,cases,deaths,cases_per_100k,cases_per_population,last_update,cases7_per_100k,death_rate&returnGeometry=false&outSR=4326&f=json");
    const apidata = response.data;

    for (const feature of apidata.features) {
        let district = {}
        district.name = feature.attributes.GEN;
        district.county = feature.attributes.county;
        district.count = feature.attributes.cases;
        district.deaths = feature.attributes.deaths;
        district.weekIncidence = feature.attributes.cases7_per_100k;
        district.casesPer100k = feature.attributes.cases_per_100k;
        district.casesPerPopulation = feature.attributes.cases_per_population;
        district.population = feature.attributes.EWZ;
        district.death_rate = feature.attributes.death_rate;

        districts.push(district);
    }

    res.json({ 
        lastUpdate: apidata.features[0].attributes.last_update, 
        districts: districts
    })
}
