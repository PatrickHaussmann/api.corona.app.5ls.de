const axios = require("axios");

module.exports = async (req, res) => {
  const response = await axios.get("https://api.corona-zahlen.org/states");
  
  res.json({response, query: req.query, url: req.url});
};
