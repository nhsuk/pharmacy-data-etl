const chai = require('chai');
const fs = require('fs');
const moment = require('moment');
const nock = require('nock');

const expect = chai.expect;

const etl = require('../../app/lib/smartEtl');
const config = require('../../app/lib/config');

const dateStampFormat = 'YYYYMMDD';
const etlStore = etl.etlStore;

function mockDataService(ids, data, idsDate, dataDate) {
  return {
    getLatestData: () => new Promise(resolve => resolve({ data, date: dataDate })),
    getLatestIds: () => new Promise(resolve => resolve({ data: ids, date: idsDate })),
    localSeedIdFile: `${config.outputDir}/${config.outputFile}-seed-ids.json`,
    uploadData: () => new Promise(resolve => resolve(true)),
    uploadIds: () => new Promise(resolve => resolve(true)),
    uploadSummary: () => new Promise(resolve => resolve(true)),
  };
}

function readFile(path) {
  return fs.readFileSync(path, 'utf8');
}

function readSeedIds(dataService) {
  return JSON.parse(readFile(dataService.localSeedIdFile));
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

function stubPharmacy404(odsCode) {
  nock(config.orgApiUrl)
    .get(`/${odsCode}`)
    .reply(404, '404 error - page not found');
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
  it('should update all records if one modified', async () => {
    const idsDate = moment('20180125', dateStampFormat);
    const dataDate = idsDate;
    stubOneModifiedRecord(idsDate);
    stubPharmacyLookup('test/resources/org-one.json', 'one');
    stubPharmacyLookup('test/resources/org-two.json', 'two');
    stubPharmacyLookup('test/resources/org-three.json', 'three');
    const ids = ['one', 'two', 'three'];
    const data = [
      { identifier: ids[0], name: 'One' },
      { identifier: ids[1], name: 'Two' },
      { identifier: ids[2], name: 'Three' },
    ];

    await etl.start(mockDataService(ids, data, idsDate, dataDate));
    expect(etlStore.getIds().length).to.equal(3);
    expect(etlStore.getRecord('one').name).to.equal('One Updated');
    expect(etlStore.getRecord('two').name).to.equal('Two Updated');
    expect(etlStore.getRecord('three').name).to.equal('Three Updated');
  });

  it('should reload all data even if no records modified', async () => {
    const idsDate = moment('20180125', dateStampFormat);
    const dataDate = idsDate;
    stubNoModifiedRecords(dataDate);
    stubPharmacyLookup('test/resources/org-one.json', 'one');
    stubPharmacyLookup('test/resources/org-two.json', 'two');
    stubPharmacyLookup('test/resources/org-three.json', 'three');
    const ids = ['one', 'two', 'three'];
    const data = [
      { identifier: ids[0], name: 'One' },
      { identifier: ids[1], name: 'Two' },
      { identifier: ids[2], name: 'Three' },
    ];

    await etl.start(mockDataService(ids, data, idsDate, dataDate));
    expect(etlStore.getIds().length).to.equal(3);
    expect(etlStore.getRecord('one').name).to.equal('One Updated');
    expect(etlStore.getRecord('two').name).to.equal('Two Updated');
    expect(etlStore.getRecord('three').name).to.equal('Three Updated');
  });

  it('should add new records from lastModified end point to ID list', async () => {
    const idsDate = moment('20180125', dateStampFormat);
    const dataDate = idsDate;
    stubAnotherModifiedRecord(idsDate);
    stubPharmacyLookup('test/resources/org-one.json', 'one');
    stubPharmacyLookup('test/resources/org-two.json', 'two');
    stubPharmacyLookup('test/resources/org-three.json', 'three');
    stubPharmacyLookup('test/resources/org-four.json', 'four');
    const ids = ['one', 'two', 'three'];
    const data = [
      { identifier: ids[0], name: 'One' },
      { identifier: ids[1], name: 'Two' },
      { identifier: ids[2], name: 'Three' },
    ];

    const dataService = mockDataService(ids, data, idsDate, dataDate);
    await etl.start(dataService);
    expect(etlStore.getIds().length).to.equal(4);
    expect(etlStore.getRecord('one').name).to.equal('One Updated');
    expect(etlStore.getRecord('two').name).to.equal('Two Updated');
    expect(etlStore.getRecord('three').name).to.equal('Three Updated');
    expect(etlStore.getRecord('four').name).to.equal('Four is new');

    const seedIdsFromFile = readSeedIds(dataService);
    expect(seedIdsFromFile.length).to.equal(4);
    expect(seedIdsFromFile[0]).to.equal('one');
    expect(seedIdsFromFile[1]).to.equal('two');
    expect(seedIdsFromFile[2]).to.equal('three');
    expect(seedIdsFromFile[3]).to.equal('four');
  });

  it('should remove 404ing records from etl store', async () => {
    const idsDate = moment('20180125', dateStampFormat);
    const dataDate = idsDate;
    stubNoModifiedRecords(dataDate);
    stubPharmacy404('one');
    stubPharmacyLookup('test/resources/org-two.json', 'two');
    stubPharmacy404('two');
    const ids = ['one', 'two', 'three'];
    const data = [
      { identifier: ids[0], name: 'One' },
      { identifier: ids[1], name: 'Two' },
      { identifier: ids[2], name: 'Three' },
    ];

    await etl.start(mockDataService(ids, data, idsDate, dataDate));
    expect(etlStore.getIds().length).to.equal(3);
    expect(etlStore.getErroredIds().length).to.equal(2);
    expect(etlStore.getRecord('one')).to.be.undefined;
    expect(etlStore.getRecord('two').name).to.equal('Two Updated');
    expect(etlStore.getRecord('three')).to.be.undefined;
  });

  afterEach(() => {
    nock.cleanAll();
  });
});
