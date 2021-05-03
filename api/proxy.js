const axios = require("axios");

module.exports = async (req, res) => {
  const response = await axios.get("https://api.corona-zahlen.org/states");
  console.log(req.query)
  console.log(req.url)
  res.json({response});
};
