const axios = require("axios");
const simplify = require('@turf/simplify')

module.exports = async (req, res) => {

    const response = await axios.get("https://opendata.arcgis.com/datasets/248e105774144a27aca2dfbfe080fc9d_0.geojson");
    const apidata = response.data;

    var options = { tolerance: 0.1, highQuality: true };
    var simplified = simplify(apidata, options)
    simplified.crs = undefined

    for (const feature of simplified.features) {
        for (const key in feature.properties) {
            if (feature.properties.hasOwnProperty(key)) {
                if (!["GEN", "AGS"].includes(key)) feature.properties[key] = undefined
            }
        }
    }

    res.json(simplified)
}

