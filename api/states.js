const axios = require("axios");

module.exports = async (req, res) => {

    res.setHeader('Cache-Control', 's-maxage=3600');

    let states = [];
    
    const response = await axios.get("https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%C3%A4lle_in_den_Bundesl%C3%A4ndern/FeatureServer/0/query?where=1%3D1&outFields=LAN_ew_GEN,LAN_ew_EWZ,Fallzahl,Aktualisierung,faelle_100000_EW,Death,cases7_bl_per_100k&returnGeometry=false&outSR=4326&f=json");
    const apidata = response.data;

    for (const feature of apidata.features) {
        let state = new State();
        state.name = feature.attributes.LAN_ew_GEN;
        state.count = feature.attributes.Fallzahl;
        state.deaths = feature.attributes.Death;
        state.weekIncidence = feature.attributes.cases7_bl_per_100k;
        state.casesPer100k = feature.attributes.faelle_100000_EW;
        state.code = getAbbreviation(state.name);

        states.push(state);
    }

    res.json({ lastUpdate: apidata.features[0].attributes.Aktualisierung, states: states })
}

function getAbbreviation(name) {
    switch (name) {
        case "Baden-Württemberg":
            return "BW";
        case "Bayern":
            return "BY";
        case "Berlin":
            return "BE";
        case "Brandenburg":
            return "BB";
        case "Bremen":
            return "HB";
        case "Hamburg":
            return "HH";
        case "Hessen":
            return "HE";
        case "Mecklenburg-Vorpommern":
            return "MV";
        case "Niedersachsen":
            return "NI";
        case "Nordrhein-Westfalen":
            return "NW";
        case "Rheinland-Pfalz":
            return "RP";
        case "Saarland":
            return "SL";
        case "Sachsen":
            return "SN";
        case "Sachsen-Anhalt":
            return "ST";
        case "Schleswig-Holstein":
            return "SH";
        case "Thüringen":
            return "TH";
        default:
            return "Unknown";
    }
}
