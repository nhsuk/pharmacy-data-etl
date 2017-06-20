const chai = require('chai');

const fixPhoneNumbers = require('../../app/lib/fixPhoneNumbers');

const expect = chai.expect;

describe('Fix Phone Numbers', () => {
  it('should correct format of top level contacts of pharmacy', () => {
    const pharmacy = {
      contacts: {
        telephoneNumber: '01778422007',
        fax: '01778421433',
      },
    };

    fixPhoneNumbers(pharmacy);
    expect(pharmacy.contacts.telephoneNumber).to.equal('01778 422007');
    expect(pharmacy.contacts.fax).to.equal('01778 421433');
  });

  it('should correct format of alternative contacts of pharmacy', () => {
    const pharmacy = {
      contacts: {
        additionalContacts: [
          {
            telephoneNumber: '01778422007',
            fax: '01778421433',
          },
          {
            telephoneNumber: '01778422008',
            fax: '01778421434',
          },
        ],
      },
    };

    fixPhoneNumbers(pharmacy);

    expect(pharmacy.contacts.additionalContacts[0].telephoneNumber).to.equal('01778 422007');
    expect(pharmacy.contacts.additionalContacts[0].fax).to.equal('01778 421433');
    fixPhoneNumbers(pharmacy);
    expect(pharmacy.contacts.additionalContacts[1].telephoneNumber).to.equal('01778 422008');
    expect(pharmacy.contacts.additionalContacts[1].fax).to.equal('01778 421434');
  });
});
