const axios = require("axios");

module.exports = async (req, res) => {

    let data = {};

    const cases_response = await axios.get("https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=AGS,GEN,EWZ,cases,deaths,cases_per_100k,cases_per_population,last_update,cases7_per_100k,death_rate&returnGeometry=false&outSR=4326&f=json");
    const cases_apidata = cases_response.data;


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
        if (district.beds_available && district.beds_total) {
            district.proportion_beds_available = district.beds_available / district.beds_total * 100;
        } else {
            district.proportion_beds_available = null
        }

        district.proportion_beds_covid = feature.attributes.Anteil_COVID_betten;
        district.proportion_beds_covid_ventilated = feature.attributes.Anteil_covid_beatmet;

        if (district.proportion_beds_available) district.proportion_beds_available = Math.round(district.proportion_beds_available)
        if (district.proportion_beds_covid_ventilated) district.proportion_beds_covid_ventilated = Math.round(district.proportion_beds_covid_ventilated)
        if (district.proportion_beds_covid) district.proportion_beds_covid = Math.round(district.proportion_beds_covid)
    }


    let districts = [];
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const element = data[key];
            districts.push(element)
        }
    }

    res.json({
        districts: districts
    })

}
