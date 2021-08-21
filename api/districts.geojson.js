const axios = require("axios");
const simplify = require("@turf/simplify");

module.exports = async (req, res) => {
  const response = await axios.get(
    "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=GEN,AGS,EWZ&outSR=4326&f=json"
  );
  const apidata = response.data;

  // ~0.001 < tolerance < ~0.01
  var options = { tolerance: 0.005, highQuality: true };
  var simplified = simplify(apidata, options);
  simplified.crs = undefined;
  simplified.name = "Landkreise";

  for (const feature of simplified.features) {
    feature.properties.name = feature.properties.GEN;
    feature.properties.population = feature.properties.EWZ;
    feature.properties.ags = feature.properties.AGS;
    feature.properties.id = feature.properties.ags;

    for (const key in feature.properties) {
      if (feature.properties.hasOwnProperty(key)) {
        if (!["name", "population", "ags", "id"].includes(key))
          feature.properties[key] = undefined;
      }
    }
  }

  res.json(simplified);
};
