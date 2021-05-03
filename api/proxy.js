const axios = require("axios");

module.exports = async (req, res) => {
  const response = await axios.get(
    "https://api.corona-zahlen.org/" + req.query.path
  );

  let data = response.data;
  let debug = {
    status: response.status,
    url: response.config.url,
    headers: response.headers,
  };

  if (data.meta) data.meta.debug = debug;
  else data.debug = debug;

  res.json(data);
};
