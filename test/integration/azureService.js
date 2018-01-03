const chai = require('chai');

const azureService = require('../../app/lib/azureService');

const expect = chai.expect;
// writing to a shared area, timestamp file to avoid collisions
const name = `${new Date().getTime()}test.json`;
const timeout = 15000;

describe('Azure Service', () => {
  after(function deleteGeneratedFile(done) {
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
        expect(entries).to.exist;
        done();
      })
      .catch(done);
  });
});
