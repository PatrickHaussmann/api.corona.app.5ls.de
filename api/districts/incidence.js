const axios = require("axios");
const xlsx = require("xlsx");

function checkLastConsecutive(array, valueToCheck) {
  const stopCount = 5;
  const startCount = 3;

  //array = array.reverse()
  array = array.map((x) => {
    const value = x.value >= valueToCheck;
    const date = new Date(x.date);
    const dayOfWeek = date.getDay();
    const isWeekday = ![0, 6].includes(dayOfWeek); // is not saturday or sunday
    return { value, date: x.date, isWeekday };
  });

  let consecutive = { ones: 0, zeros: 0 };

  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    if (element.value) {
      consecutive.zeros = 0;
      consecutive.ones++;
    } else {
      consecutive.ones = 0;
      if (element.isWeekday) {
        consecutive.zeros++;
      }
    }

    array[i].ones = consecutive.ones;
    array[i].zeros = consecutive.zeros;

    if (consecutive.ones >= startCount) {
      return true;
    } else if (consecutive.zeros >= stopCount) {
      return false;
    }
  }

  return null;
}

const valuesToCheck = [165, 150, 100].sort().reverse();

function checkNotbremse(array) {
  for (const [index, valueToCheck] of valuesToCheck.entries()) {
    let checkResult = checkLastConsecutive(array, valueToCheck);
    if (checkResult) {
      return "notbremse_" + valueToCheck;
    } else if (checkResult == null) {
      return null;
    }
  }
  return "notbremse_null";
}

module.exports = async (req, res) => {
  //frozen
  const response = await axios.get(
    "https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Daten/Fallzahlen_Kum_Tab.xlsx?__blob=publicationFile",
    {
      responseType: "arraybuffer",
    }
  );
  const data = response.data;

  //updated
  // https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Daten/Fallzahlen_Inzidenz_aktualisiert.xlsx?__blob=publicationFile

  var workbook = xlsx.read(data, { type: "buffer", cellDates: true });
  const sheet = workbook.Sheets["LK_7-Tage-Inzidenz"];
  const json = xlsx.utils.sheet_to_json(sheet, { header: false });

  const header = json.shift();
  let lastUpdate = Object.keys(json[0])[0];

  let districts = {};

  json.forEach((element) => {
    let keys = Object.keys(element);
    keys.shift(); // rowNumber
    keys.shift(); // Name
    let ags = element[keys.shift()];

    let history = [];
    keys.forEach((key) => {
      history.push({ date: header[key], value: element[key] });
    });
    history.reverse();

    districts[ags] = { history: history.slice(0, 15) };

    districts[ags].notbremseActiveToday = checkNotbremse(history.slice(2));
    districts[ags].notbremseActivePlus1Day = checkNotbremse(history.slice(1));
    districts[ags].notbremseActivePlus2Days = checkNotbremse(history.slice(0));
    districts[ags].notbremseDate = history[0].date;
  });

  res.json({ lastUpdate, districts });
  return;
  const latestEntry = json[json.length - 1];
  const dateString =
    latestEntry["Datum des Erkrankungsbeginns"] ||
    latestEntry["Datum des Erkrankungs-beginns"];
  let rValue =
    latestEntry["Punktschätzer des 4-Tage R-Wertes"] ||
    latestEntry["Punktschätzer der 4-Tage R-Wert"] ||
    latestEntry["Punktschätzer des 4-Tage-R-Wertes"];

  if (typeof rValue === "string" || rValue instanceof String) {
    rValue = parseFloat(rValue.replace(",", "."));
  }

  const pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
  const date = new Date(dateString.replace(pattern, "$3-$2-$1"));

  res.json({
    data: rValue,
    lastUpdate: date,
    json,
  });
};
