const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = async (req, res) => {

    let result = {}

    const response = await axios.get("https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html");
    
    const dom = new JSDOM(response.data);
    var htmlDoc = dom.window.document
    

    result.lastUpdate = htmlDoc.getElementById("main").getElementsByTagName("p")[0].textContent.split(" (")[0].substring(7)
    
    let tds = htmlDoc.getElementById("main").getElementsByTagName("table")[0].getElementsByTagName("tbody")[0].getElementsByTagName("tr")[16].getElementsByTagName("td")
    
    result.count = parseInt(tds[1].textContent.trim().replace(',','.'))
    result.deaths = parseInt(tds[5].textContent.trim().replace(',','.'))
    result.weekIncidence = parseInt(tds[4].textContent.trim().replace(',','.'))
    result.diff = parseInt(tds[2].textContent.trim().replace(',','.'))
    result.last7d = parseInt(tds[3].textContent.trim().replace(',','.'))

    res.json(result)
}
