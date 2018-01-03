const apiRequest = require('../etl-toolkit/apiRequest');
const fixPhoneNumbers = require('../fixPhoneNumbers');
const fixAddress = require('../fixAddress');
const joinContiguousTimes = require('../joinContiguousTimes');
const config = require('../config');

function toObject(pharmaString) {
  const pharmacy = JSON.parse(pharmaString);
  fixPhoneNumbers(pharmacy);
  joinContiguousTimes(pharmacy);
  fixAddress(pharmacy.address);
  return pharmacy;
}

function getPharmacy(odsCode) {
  const url = `${config.orgApiUrl}/${odsCode}`;
  return apiRequest(url).then(toObject);
}

module.exports = getPharmacy;
