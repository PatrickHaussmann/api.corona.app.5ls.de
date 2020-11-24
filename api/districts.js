const axios = require("axios");
const interpolate = require('color-interpolate');
const rgbaToHex = require('hex-and-rgba').rgbaToHex;
const parse = require('color-parse')
const lerp = require('lerp')

function map(n, start1, stop1, start2, stop2) {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
};

function toHex(color) {
    let parsed_color = parse(color)
    let rgb = parsed_color.values

    if (parsed_color.alpha != 1) rgb.push(parsed_color.alpha)
    let hex = rgbaToHex(...rgb)
    return hex
}


module.exports = async (req, res) => {

    let data = {};
    let series = {};

    const cases_response = await axios.get("https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=AGS,GEN,EWZ,cases,deaths,cases_per_100k,cases_per_population,last_update,cases7_per_100k,death_rate&returnGeometry=false&outSR=4326&f=json");
    const cases_apidata = cases_response.data;

    function update_series(keys, dict) {
        keys.forEach(key => {
            if (key in series) {
                series[key].min = Math.min(series[key].min, dict[key])
                series[key].max = Math.max(series[key].max, dict[key])
            } else {
                series[key] = {
                    min: dict[key],
                    max: dict[key]
                }
            }
        })
    }


    for (const feature of cases_apidata.features) {
        let ags = feature.attributes.AGS
        data[ags] = {}
        let district = data[ags]

        district.ags = feature.attributes.AGS;
        district.name = feature.attributes.GEN;
        district.cases = feature.attributes.cases;
        district.deaths = feature.attributes.deaths;
        district.population = feature.attributes.EWZ;
        district.week_incidence = feature.attributes.cases7_per_100k;
        district.cases_per_100k = feature.attributes.cases_per_100k;
        district.cases_per_population = feature.attributes.cases_per_population;
        district.death_rate = feature.attributes.death_rate;

        update_series(["cases", "deaths", "population", "week_incidence", "cases_per_100k", "cases_per_population", "death_rate"], district)
    }

    const beds_response = await axios.get("https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/DIVI_Intensivregister_Landkreise/FeatureServer/0/query?where=1%3D1&outFields=AGS,betten_frei,betten_belegt,betten_gesamt,Anteil_betten_frei,faelle_covid_aktuell,faelle_covid_aktuell_beatmet,Anteil_covid_beatmet,Anteil_COVID_betten,daten_stand&returnGeometry=false&outSR=4326&f=json");
    const beds_apidata = beds_response.data;

    for (const feature of beds_apidata.features) {
        let ags = feature.attributes.AGS
        if (!data[ags]) data[ags] = {}
        let district = data[ags]

        district.beds_available = feature.attributes.betten_frei;
        district.beds_occupied = feature.attributes.betten_belegt;
        district.beds_total = feature.attributes.betten_gesamt;
        district.beds_covid = feature.attributes.faelle_covid_aktuell;
        district.beds_covid_ventilated = feature.attributes.faelle_covid_aktuell_beatmet;
        district.proportion_beds_available = null
        if (district.beds_available && district.beds_total) district.proportion_beds_available = district.beds_available / district.beds_total * 100;

        district.proportion_beds_covid = feature.attributes.Anteil_COVID_betten;
        district.proportion_beds_covid_ventilated = feature.attributes.Anteil_covid_beatmet;

        if (district.proportion_beds_available) district.proportion_beds_available = Math.round(district.proportion_beds_available)
        if (district.proportion_beds_covid) district.proportion_beds_covid = Math.round(district.proportion_beds_covid)
        if (district.proportion_beds_covid_ventilated) district.proportion_beds_covid_ventilated = Math.round(district.proportion_beds_covid_ventilated)

        update_series(["beds_available", "beds_occupied", "beds_total", "beds_covid", "beds_covid_ventilated", "proportion_beds_available", "proportion_beds_covid", "proportion_beds_covid_ventilated"], district)
    }


    let districts = [];
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const element = data[key];
            districts.push(element)
        }
    }

    res.json({ series, districts })

}
