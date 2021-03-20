const axios = require("axios");

module.exports = async (req, res) => {
    const cases_promise = axios.get("https://api.corona-zahlen.org/germany");
    const vaccinations_promise = axios.get(
        "https://api.corona-zahlen.org/vaccinations"
    );

    const [cases_response, vaccinations_response] = await Promise.all([
        cases_promise,
        vaccinations_promise,
    ]);

    const cases = cases_response.data;
    const vaccinations = vaccinations_response.data.data;
    let result = cases;
    result.rValue = result.r.value;
    result.r = undefined;
    
    result.vaccinated = vaccinations.vaccinated
    result.delta.vaccinated = vaccinations.delta
    result.vaccinatedQuote = vaccinations.quote
    result.secondVaccination = vaccinations.secondVaccination.vaccinated
    result.delta.secondVaccination = vaccinations.secondVaccination.delta
    result.secondVaccinationQuote = vaccinations.secondVaccination.quote
    result.lastUpdateVaccinations = vaccinations_response.data.meta.lastUpdate;

    result.lastUpdate = result.meta.lastUpdate;
    result.lastCheckedForUpdate = new Date();
    result.meta = undefined;
    res.json(result);
};
