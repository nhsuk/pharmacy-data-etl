const apiRequest = require('../etl-toolkit/apiRequest');
const fixPhoneNumbers = require('../fixPhoneNumbers');
const config = require('../config');

function toObject(pharmaString, odsCode) {
  const pharmacy = JSON.parse(pharmaString);
  // eslint-disable-next-line no-underscore-dangle
  pharmacy._id = odsCode;
  fixPhoneNumbers(pharmacy);
  return pharmacy;
}

function getPharmacy(odsCode) {
  const url = `${config.orgApiUrl}/${odsCode}`;
  return apiRequest(url).then(pharmaString => toObject(pharmaString, odsCode));
}

module.exports = getPharmacy;
