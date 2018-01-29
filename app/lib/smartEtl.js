const moment = require('moment');
const etlStore = require('./etl-toolkit/etlStore');
const fsHelper = require('./fsHelper');
const azureService = require('./azureService');
const config = require('./config');
const syndicationService = require('./syndicationService');
const mapTotalPages = require('./mappers/mapTotalPages');
const populateIdListQueue = require('./etl-toolkit/queues/populateIds');
const populateRecordsFromIdsQueue = require('./etl-toolkit/queues/populateRecordsFromIds');
const getModifiedOdsCodes = require('./actions/getModifiedOdsCodes');
const getPharmacy = require('./actions/getPharmacy');
const log = require('./logger');
const uploadOutputToAzure = require('./uploadOutputToAzure');

const datePattern = /pharmacy-seed-ids-(\d+).json/i;

const RECORD_KEY = 'identifier';
const WORKERS = 1;
let resolvePromise;

etlStore.setIdKey(RECORD_KEY);

function getDate(url) {
  const match = datePattern.exec(url);
  if (match && match.length === 2) {
    return match[1];
  }
  return undefined;
}
function sortByDateDesc(first, second) {
  const a = moment(first.lastModified);
  const b = moment(second.lastModified);
  if (a.isBefore(b)) {
    return 1;
  }
  if (b.isBefore(a)) {
    return -1;
  }
  return 0;
}

async function getLastScanBlob() {
  return (await azureService.listBlobs())
    .filter(b => b.name.startsWith('pharmacy-data-') && b.name.endsWith(`${config.version}.json`))
    .sort(sortByDateDesc)[0];
}

async function getLastSeedBlob() {
  return (await azureService.listBlobs())
    .filter(b => b.name.startsWith('pharmacy-seed-ids-'))
    .sort(sortByDateDesc)[0];
}

async function loadLatestEtlData() {
  const lastScan = await getLastScanBlob();
  if (lastScan) {
    // if current version save to output/pharmacy-data.json;
    await azureService.downloadFromAzure('./output/pharmacy-data.json', lastScan.name);
    fsHelper.loadJsonSync('pharmacy-data').map(r => etlStore.addRecord(r));
    return moment(lastScan.lastModified);
  }
  return undefined;
}

async function loadLatestIDList() {
  const seedBlob = await getLastSeedBlob();
  if (seedBlob) {
    const seedTimestamp = getDate(seedBlob.name);
    const seedDate = moment(seedTimestamp, 'YYYYMMDD');
    etlStore.setLastRunDate(seedDate);
    await azureService.downloadFromAzure('./output/seed-ids.json', seedBlob.name);
    etlStore.addIds(fsHelper.loadJsonSync('seed-ids'));
  } else {
    throw Error('unable to retrieve ID list');
  }
}

function clearState() {
  populateIdListQueue.clearState();
  etlStore.clearState();
}

async function etlComplete() {
  etlStore.saveRecords();
  etlStore.saveSummary();
  await uploadOutputToAzure();
  clearState();
  if (resolvePromise) {
    resolvePromise();
  }
}
function startPopulateRecordsFromIdsQueue() {
  const options = {
    workers: WORKERS,
    queueComplete: etlComplete,
    populateRecordAction: getPharmacy
  };
  populateRecordsFromIdsQueue.start(options);
}

async function getTotalModifiedSincePages(lastScanDate) {
  const page = await syndicationService.getModifiedSincePage(lastScanDate, 1);
  return mapTotalPages(page);
}

async function smartEtl() {
  etlStore.clearState();
  await loadLatestIDList();
  log.info(etlStore.getIds().length);
  await loadLatestEtlData();
  // read IDs updated since snapshot timestamp
  const totalChangedPages = await getTotalModifiedSincePages(etlStore.getLastRunDate());
  log.info(`${totalChangedPages} pages of modified records since ${etlStore.getLastRunDate()}`);
  etlStore.clearIds();
  for (let page = 1; page <= totalChangedPages; page++) {
    // eslint-disable-next-line no-await-in-loop
    const pageIds = await getModifiedOdsCodes(etlStore.getLastRunDate(), page);
    etlStore.addIds(pageIds);
  }
  log.info(`Refreshing ${etlStore.getIds().length} records`);
  // run scan of IDs not in etl store
  startPopulateRecordsFromIdsQueue();
}

module.exports = {
  start: smartEtl
};
