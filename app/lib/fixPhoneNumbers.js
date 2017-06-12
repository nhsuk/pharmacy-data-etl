const phoneNumberParser = require('./phoneNumberParser');

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

module.exports = fixPhoneNumbers;
