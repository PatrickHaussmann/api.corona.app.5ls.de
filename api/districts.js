const axios = require("axios");

module.exports = async (req, res) => {
    const cases_promise = axios.get("https://api.corona-zahlen.org/districts");
    const beds_promise = axios.get(
        "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/DIVI_Intensivregister_Landkreise/FeatureServer/0/query?where=1%3D1&outFields=AGS,betten_frei,betten_belegt,betten_gesamt,Anteil_betten_frei,faelle_covid_aktuell,faelle_covid_aktuell_beatmet,Anteil_covid_beatmet,Anteil_COVID_betten,daten_stand&returnGeometry=false&outSR=4326&f=json"
    );

    const [cases_response, beds_response] = await Promise.all([
        cases_promise,
        beds_promise,
    ]);

    const cases = cases_response.data.data;
    const beds = beds_response.data;

    let result = {
        data: cases,
    };

    for (const ags in result.data) {
        if (Object.hasOwnProperty.call(result.data, ags)) {
            const district = result.data[ags];

            if (district.population != null && district.cases != null)
                district.casesRate = district.population / district.cases;
            if (district.cases != null && district.deaths != null)
                district.deathsRate = district.cases / district.deaths;
        }
    }

    for (const feature of beds.features) {
        let ags = feature.attributes.AGS;
        if (!result.data[ags]) result.data[ags] = {};
        let district = result.data[ags];

        district.bedsAvailable = feature.attributes.betten_frei;
        district.bedsOccupied = feature.attributes.betten_belegt;
        district.bedsTotal = feature.attributes.betten_gesamt;
        district.bedsCovid = feature.attributes.faelle_covid_aktuell;
        district.bedsCovidVentilated =
            feature.attributes.faelle_covid_aktuell_beatmet;
        district.proportionBedsAvailable = null;
        if (district.bedsAvailable != null && district.bedsTotal != null)
            district.proportionBedsAvailable =
                district.bedsAvailable / district.bedsTotal;

        district.proportionBedsCovid =
            feature.attributes.Anteil_COVID_betten / 100;
        district.proportionBedsCovidVentilated =
            feature.attributes.Anteil_covid_beatmet / 100;
    }

    result.lastUpdate = cases_response.data.meta.lastUpdate;
    result.lastUpdateBeds = cases_response.data.meta.lastUpdate;
    result.lastCheckedForUpdate = new Date();
    result.meta = undefined;
    res.json(result);
};
