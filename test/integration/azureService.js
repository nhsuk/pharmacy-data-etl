const chai = require('chai');

const azureService = require('../../app/lib/azureService');

const expect = chai.expect;
const name = 'test-file.json';
const timeout = 5000;

describe('Azure Service', () => {
  after(function test(done) {
    // clean up created file
    this.timeout(timeout);
    azureService.deleteFromAzure(name).then(() => done());
  });

  it('should upload file to azure', function test(done) {
    this.timeout(timeout);
    azureService.uploadToAzure('test/resources/test-file.json', name)
      .then((result) => {
        expect(result.name).to.equal(name);
        done();
      })
      .catch(done);
  });

  it('should list files in blob', function test(done) {
    this.timeout(timeout);
    azureService.listBlobs()
      .then((entries) => {
        // smoke test to ensure we can list files for development purposes
        // eslint-disable-next-line no-unused-expressions
        expect(entries).to.exist;
        done();
      })
      .catch(done);
  });
});
