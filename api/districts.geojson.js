const axios = require("axios");
const simplify = require('@turf/simplify')

module.exports = async (req, res) => {

    const response = await axios.get("https://opendata.arcgis.com/datasets/917fc37a709542548cc3be077a786c17_0.geojson");
    const apidata = response.data;
    
    // ~0.001 < tolerance < ~0.01
    var options = { tolerance: 0.003, highQuality: true };
    var simplified = simplify(apidata, options)
    simplified.crs = undefined

    for (const feature of simplified.features) {
        feature.properties.ags = feature.properties.AGS
        feature.properties.rs = feature.properties.RS
        feature.properties.gen = feature.properties.GEN
        for (const key in feature.properties) {
            if (feature.properties.hasOwnProperty(key)) {
                if (!["gen", "ags", "rs"].includes(key)) feature.properties[key] = undefined
            }
        }
    }

    res.json(simplified)
}

