const apiRequest = require('../etl-toolkit/apiRequest');
const phoneNumberParser = require('../phoneNumberParser');

const baseUrl = 'http://api.nhs.uk/organisations';

function fixContactNumbers(contact) {
  /* eslint-disable no-param-reassign */
  if (contact.telephoneNumber) {
    contact.telephoneNumber = phoneNumberParser(contact.telephoneNumber);
  }
  if (contact.fax) {
    contact.fax = phoneNumberParser(contact.fax);
  }
  /* eslint-enable no-param-reassign */
}

function fixPhoneNumbers(pharmacy) {
  if (pharmacy.contacts) {
    fixContactNumbers(pharmacy.contacts);
    if (pharmacy.contacts.additionalContacts) {
      pharmacy.contacts.additionalContacts.forEach(fixContactNumbers);
    }
  }
}

function toObject(pharmaString, odsCode) {
  const pharmacy = JSON.parse(pharmaString);
  // eslint-disable-next-line no-underscore-dangle
  pharmacy._id = odsCode;
  fixPhoneNumbers(pharmacy);
  return pharmacy;
}

function getPharmacy(odsCode) {
  const url = `${baseUrl}/${odsCode}`;
  return apiRequest(url).then(pharmaString => toObject(pharmaString, odsCode));
}

module.exports = getPharmacy;
