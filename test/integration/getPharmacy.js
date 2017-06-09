const chai = require('chai');
const getPharmacy = require('../../app/lib/actions/getPharmacy');

const expect = chai.expect;

describe('Get Pharmacy', () => {
  it('should retrieve pharmacy data from organisation API', (done) => {
    const odsCode = 'FYY76';
    getPharmacy(odsCode).then((pharmacy) => {
      // eslint-disable-next-line no-unused-expressions
      expect(pharmacy).to.exist;
      expect(pharmacy.identifier).to.equal(odsCode);
      done();
    }).catch(done);
  });
});
