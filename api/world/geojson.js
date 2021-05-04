const axios = require("axios");

module.exports = async (req, res) => {
  const response = await axios.get(
    "https://cdn.jsdelivr.net/gh/johan/world.geo.json@34c96bba9c07d2ceb30696c599bb51a5b939b20f/countries.geo.json"
  );
  const data = response.data;

  for (const feature of data.features) {
    feature.properties.id = feature.id;
    feature.id = undefined
  }

  res.json(data);
};
