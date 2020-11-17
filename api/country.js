const axios = require("axios");

module.exports = async (req, res) => {

    let result = {}

    const response = await axios.get("https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html");
    
    var htmlDoc = document.createElement( 'html' );
    htmlDoc.innerHTML = response.data
    
    let tds = htmlDoc.getElementById("main").getElementsByTagName("table")[0].getElementsByTagName("tbody")[0].getElementsByTagName("tr")[16].getElementsByTagName("td")
    
    result.count = tds[1].innertText
    result.deaths = tds[5].innertText
    result.weekIncidence = tds[4].innertText
    result.diff = tds[2].innertText
    result.last7d = tds[3].innertText
    

    res.json(result)
}
