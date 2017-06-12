const chai = require('chai');
const azureService = require('../../app/lib/azureService');

const expect = chai.expect;

describe('Azure Service', () => {
  it('should upload file to azure', function test(done) {
    this.timeout(5000);
    const name = 'test-file.json';
    azureService.uploadToAzure('test/resources/test-file.json', name)
    .then((result) => {
      expect(result.name).to.equal(name);
      done();
    })
    .catch(done);
  });

  it('should list files in blob', function test(done) {
    this.timeout(50000);
    azureService.listBlobs()
    .then((entries) => {
      expect(entries.length).to.be.greaterThan(0);
      done();
    })
    .catch(done);
  });
});
