const chai = require('chai');
const fs = require('fs');
const moment = require('moment');
const nock = require('nock');

const expect = chai.expect;

const etl = require('../../app/lib/smartEtl');
const etlStore = require('../../app/lib/etl-toolkit/etlStore');
const config = require('../../app/lib/config');

function mockDataService(ids, data, idsDate, dataDate) {
  return {
    getLatestIds: () => new Promise(resolve => resolve({ ids, date: idsDate })),
    getLatestData: () => new Promise(resolve => resolve({ data, date: dataDate })),
    uploadData: () => new Promise(resolve => resolve(true)),
  };
}

function readFile(path) {
  return fs.readFileSync(path, 'utf8');
}

function stubResults(filePath, date) {
  const url = `/modifiedsince/${date.year()}/${date.month() + 1}/${date.date()}.xml?apikey=${process.env.SYNDICATION_API_KEY}&page=1`;
  const stubbedData = readFile(filePath);
  nock(config.syndicationApiUrl)
    .get(url)
    .times(2)
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

function stubOneModifiedRecord(date) {
  stubResults('test/resources/one-modified-record.xml', date);
}

function stubAnotherModifiedRecord(date) {
  stubResults('test/resources/another-modified-record.xml', date);
}

function stubNoModifiedRecords(date) {
  stubResults('test/resources/no-modified-records.xml', date);
}

describe('ETL', function test() {
  this.timeout(5000);
  it('should only update changed record', async () => {
    const idsDate = moment('20180125', 'YYYYMMDD');
    const dataDate = idsDate;
    stubOneModifiedRecord(idsDate);
    stubPharmacyLookup('test/resources/org-one.json', 'one');
    const ids = ['one', 'two', 'three'];
    const data = [
      { identifier: ids[0], name: 'One' },
      { identifier: ids[1], name: 'Two' },
      { identifier: ids[2], name: 'Three' },
    ];

    await etl.start(mockDataService(ids, data, idsDate, dataDate));
    expect(etlStore.getRecord('one').name).to.equal('One Updated');
    expect(etlStore.getRecord('two').name).to.equal('Two');
    expect(etlStore.getRecord('three').name).to.equal('Three');
  });

  it('if date stamp on data is older than ID list date, should refresh records modified since data date', async () => {
    const idsDate = moment('20180126', 'YYYYMMDD');
    const dataDate = moment('20180125', 'YYYYMMDD');
    stubAnotherModifiedRecord(dataDate);
    // nock will throw an error if the other date is called, and the test will fail
    stubPharmacyLookup('test/resources/org-two.json', 'two');
    const ids = ['one', 'two', 'three'];
    const data = [
      { identifier: ids[0], name: 'One' },
      { identifier: ids[1], name: 'Two' },
      { identifier: ids[2], name: 'Three' },
    ];

    await etl.start(mockDataService(ids, data, idsDate, dataDate));
    expect(etlStore.getRecord('one').name).to.equal('One');
    expect(etlStore.getRecord('two').name).to.equal('Two Updated');
    expect(etlStore.getRecord('three').name).to.equal('Three');
  });

  it('should load record if in ID list but missing from data', async () => {
    const idsDate = moment('20180126', 'YYYYMMDD');
    const dataDate = idsDate;
    stubNoModifiedRecords(dataDate);
    // nock will throw an error if the other date is called, and the test will fail
    stubPharmacyLookup('test/resources/org-one.json', 'one');
    const ids = ['one', 'two', 'three'];
    const data = [
      { identifier: ids[1], name: 'Two' },
      { identifier: ids[2], name: 'Three' },
    ];

    await etl.start(mockDataService(ids, data, idsDate, dataDate));
    expect(etlStore.getRecord('one').name).to.equal('One Updated');
    expect(etlStore.getRecord('two').name).to.equal('Two');
    expect(etlStore.getRecord('three').name).to.equal('Three');
  });

  afterEach(() => {
    nock.cleanAll();
  });
});
