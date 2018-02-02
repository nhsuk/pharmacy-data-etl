const nock = require('nock');
const fs = require('fs');
const moment = require('moment');
const chai = require('chai');

const expect = chai.expect;

const etl = require('../../app/lib/smartEtl');
const etlStore = require('../../app/lib/etl-toolkit/etlStore');
const config = require('../../app/lib/config');

function mockDataService(ids, data, idsDate, dataDate) {
  return {
    getLatestIds: () => new Promise(resolve => resolve({ ids, date: idsDate })),
    getLatestData: () => new Promise(resolve => resolve({ data, date: dataDate })),
  };
}

function readFile(path) {
  return fs.readFileSync(path, 'utf8');
}

const uri = `/modifiedsince/2018/1/25.xml?apikey=${process.env.SYNDICATION_API_KEY}&page=1`;

function stubResults(filePath) {
  const stubbedData = readFile(filePath);
  nock(config.syndicationApiUrl)
    .get(uri)
    // .times(2)
    .reply(200, stubbedData);
}

function stubPharmacyLookup(filePath, odsCode) {
  const stubbedData = readFile(filePath);
  nock(config.orgApiUrl)
    .get(`/${odsCode}`)
    .reply(200, stubbedData);
}

beforeEach(() => {
  etlStore.clearState();
});

function stubOneModifiedRecord() {
  stubResults('test/resources/one-modified-record.xml');
  etlStore.clearState();
}

describe('ETL', function test() {
  this.timeout(5000);
  it('should complete ETL for one updatedRecords', async () => {
    stubOneModifiedRecord();
    stubOneModifiedRecord();
    stubPharmacyLookup('test/resources/org-one.json', 'one');
    const ids = ['one', 'two', 'three'];
    const data = [
      { identifier: ids[0], name: 'One' },
      { identifier: ids[1], name: 'Two' },
      { identifier: ids[2], name: 'Three' },
    ];
    const idsDate = moment('20180125', 'YYYYMMDD');
    const dataDate = idsDate;
    await etl.start(mockDataService(ids, data, idsDate, dataDate));
    expect(etlStore.getRecord('one').name).to.equal('One Updated');
    expect(etlStore.getRecord('two').name).to.equal('Two');
    expect(etlStore.getRecord('three').name).to.equal('Three');
  });

  afterEach(() => {
    nock.cleanAll();
  });
});
