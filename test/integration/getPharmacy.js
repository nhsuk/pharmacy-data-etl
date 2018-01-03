const chai = require('chai');

const getPharmacy = require('../../app/lib/actions/getPharmacy');

const expect = chai.expect;

describe('Get Pharmacy', () => {
  it('should retrieve pharmacy data from organisation API', function test(done) {
    this.timeout(5000);
    const odsCode = 'FYY76';
    getPharmacy(odsCode).then((pharmacy) => {
      expect(pharmacy).to.exist;
      expect(pharmacy.identifier).to.equal(odsCode);
      done();
    }).catch(done);
  });
});
