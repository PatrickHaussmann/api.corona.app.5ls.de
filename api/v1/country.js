const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = async (req, res) => {

    let result = {}

    const response = await axios.get("https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html");
    
    const dom = new JSDOM(response.data);
    var htmlDoc = dom.window.document
    

    result.last_update = htmlDoc.getElementById("main").getElementsByTagName("p")[0].textContent.split(" (")[0].substring(7)
    
    let tds = htmlDoc.getElementById("main").getElementsByTagName("table")[0].getElementsByTagName("tbody")[0].getElementsByTagName("tr")[16].getElementsByTagName("td")
        
    
    function parse(text) {
        return Number(text.trim().replace('*','').replace('.','').replace(',','.'))
    }
    
    
    result.cases = parse(tds[1].textContent)
    result.deaths = parse(tds[5].textContent)
    result.week_incidence = parse(tds[4].textContent)
    result.difference_to_previous_date = parse(tds[2].textContent)
    result.cases_last_7d = parse(tds[3].textContent)

    res.json(result)
}