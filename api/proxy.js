const axios = require("axios");

module.exports = async (req, res) => {
  const response = await axios.get(
    "https://api.corona-zahlen.org/" + req.query.path
  );

  let data = response.data;

  data.meta.debug = {
    status: response.status,
    url: response.config.url,
    headers: response.headers,
  };

  res.json(data);
};
