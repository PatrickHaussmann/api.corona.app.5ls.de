const axios = require("axios");
const parse = require("csv-parse/lib/sync");

module.exports = async (req, res) => {
  const csv_response = await axios.get(
    "https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Projekte_RKI/Nowcasting_Zahlen_csv.csv?__blob=publicationFile"
  );

  let options = {
    columns: true,
    skip_empty_lines: true,
    delimiter: ";",
    trim: true,
  };

  const csv = csv_response.data.split(";;;;;;;;;;;;", 1)[0];
  const apidata = parse(csv, options);

  result = {
    data: [],
  };

  apidata.forEach((element) => {
    const dateString = element["Datum"];
    let rValue = element["Schätzer_Reproduktionszahl_R"];
    rValue = parseFloat(rValue.replace(",", "."));
    let rValue7day = element["Schätzer_7_Tage_R_Wert"];
    rValue7day = parseFloat(rValue7day.replace(",", "."));

    const pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
    const date = new Date(dateString.replace(pattern, "$3-$2-$1"));

    result.data.push({ date, rValue, rValue7day });
  });

  res.json(result);
};
