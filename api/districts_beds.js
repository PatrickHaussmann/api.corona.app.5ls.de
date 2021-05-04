const axios = require("axios");

module.exports = async (req, res) => {
  const beds_response = await  axios.get(
    "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/DIVI_Intensivregister_Landkreise/FeatureServer/0/query?where=1%3D1&outFields=AGS,betten_frei,betten_belegt,betten_gesamt,Anteil_betten_frei,faelle_covid_aktuell,faelle_covid_aktuell_beatmet,Anteil_covid_beatmet,Anteil_COVID_betten,daten_stand&returnGeometry=false&outSR=4326&f=json"
  );
  
  const beds = beds_response.data;

  let result = {
    data: {},
  };

  for (const feature of beds.features) {
    let ags = feature.attributes.AGS;
    if (!result.data[ags]) result.data[ags] = {};
    let district = result.data[ags];

    district.bedsTotal = feature.attributes.betten_gesamt;
    district.proportionBedsAvailable = null;
    if (feature.attributes.betten_frei != null && district.bedsTotal != null)
      district.proportionBedsAvailable =
        feature.attributes.betten_frei / district.bedsTotal;

    district.proportionBedsCovid = feature.attributes.Anteil_COVID_betten / 100;
  }

  res.json(result);
};
