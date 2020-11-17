const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = async (req, res) => {

    let result = {}

    const response = await axios.get("https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html");
    
    const dom = new JSDOM(response.data);
    var htmlDoc = dom.window.document
    
    result.lastUpdate = htmlDoc.getElementById("main").getElementsByTagName("p")[0].innerText.split(" (")[0].substring(7)
    
    let tds = htmlDoc.getElementById("main").getElementsByTagName("table")[0].getElementsByTagName("tbody")[0].getElementsByTagName("tr")[16].getElementsByTagName("td")
    
    result.count = tds[1].innertText
    result.deaths = tds[5].innertText
    result.weekIncidence = tds[4].innertText
    result.diff = tds[2].innertText
    result.last7d = tds[3].innertText

    res.json(result)
}
