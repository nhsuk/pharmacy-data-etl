const fs = require('fs');
const chai = require('chai');
const nock = require('nock');

const azureService = require('../../app/lib/azureService');

const expect = chai.expect;
// writing to a shared area, timestamp file to avoid collisions
const name = `${new Date().getTime()}test.json`;
const timeout = 15000;

describe('Azure Service', () => {
  describe('upload, list and delete functions', () => {
    after(function deleteGeneratedFile(done) {
      this.timeout(timeout);
      azureService.deleteFromAzure(name).then(() => done());
    });

    it('should upload file to azure', function test(done) {
      this.timeout(timeout);
      azureService.uploadToAzure('test-file.json', name)
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

  describe('getLatestBlob', () => {
    it('should return the most recent blob based on the date embedded within the file name for those files that pass the filter applied', (done) => {
      const blobList = fs.readFileSync('test/resources/blobList.xml', 'utf8');
      nock('https://nhsukpharmacydataetl.blob.core.windows.net:443')
        .get('/etl-output')
        .query({ restype: 'container', comp: 'list' })
        .reply(200, blobList);

      const filter = b => b.name.startsWith('filter-match-');

      azureService.getLatestBlob(filter)
        .then((latestBlob) => {
          expect(latestBlob.name).to.equal('filter-match-20180228.json');
          done();
        })
        .catch(done);
    });
  });
});
