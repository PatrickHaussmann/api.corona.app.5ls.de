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
        
    result.count = Number(tds[1].textContent.trim().replace('.','').replace(',','.'))
    result.deaths = Number(tds[5].textContent.trim().replace('.','').replace(',','.'))
    result.weekIncidence = Number(tds[4].textContent.trim().replace('.','').replace(',','.'))
    result.diff = Number(tds[2].textContent.trim().replace('.','').replace(',','.'))
    result.last7d = Number(tds[3].textContent.trim().replace('.','').replace(',','.'))

    res.json(result)
}
