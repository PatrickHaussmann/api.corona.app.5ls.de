const axios = require("axios");

module.exports = async (req, res) => {

    let districts = [];

    const response = await axios.get("https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/DIVI_Intensivregister_Landkreise/FeatureServer/0/query?where=1%3D1&outFields=county,anzahl_standorte,anzahl_meldebereiche,betten_frei,betten_belegt,betten_gesamt,Anteil_betten_frei,faelle_covid_aktuell,faelle_covid_aktuell_beatmet,Anteil_covid_beatmet,Anteil_COVID_betten,daten_stand&returnGeometry=false&outSR=4326&f=json");
    const apidata = response.data;

    for (const feature of apidata.features) {
        let district = {}
        district.county = feature.attributes.county;
        district.anzahl_standorte = feature.attributes.anzahl_standorte;
        district.anzahl_meldebereiche = feature.attributes.anzahl_meldebereiche;
        district.betten_frei = feature.attributes.betten_frei;
        district.betten_belegt = feature.attributes.betten_belegt;
        district.betten_gesamt = feature.attributes.betten_gesamt;
        district.faelle_covid_aktuell = feature.attributes.faelle_covid_aktuell;
        district.faelle_covid_aktuell_beatmet = feature.attributes.faelle_covid_aktuell_beatmet;
        district.anteil_freier_betten = district.betten_frei/district.betten_gesamt*100;
        district.anteil_freier_betten = Math.floor(district.anteil_freier_betten)

        district.anteil_covid_beatmet = feature.attributes.Anteil_covid_beatmet;
        district.anteil_covid_betten = feature.attributes.Anteil_COVID_betten;
        if (district.anteil_covid_betten) district.anteil_covid_betten = Math.floor(district.anteil_covid_betten)

        districts.push(district);
    }

    res.json({
        lastUpdate: apidata.features[0].attributes.daten_stand,
        districts: districts
    })
}
