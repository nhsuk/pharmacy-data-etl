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

const datePattern = /.*pharmacy-seed-ids-(\d+).json/i;

const RECORD_KEY = 'identifier';
const WORKERS = 1;
let resolvePromise;

etlStore.setIdKey(RECORD_KEY);

function getDate(filename) {
  const match = datePattern.exec(filename);
  if (match && match.length === 2) {
    return match[1];
  }
  return undefined;
}

function getPrefix() {
  // prevent dev from over-writing production azure blob
  return process.env.NODE_ENV === 'production' ? '' : 'dev-';
}

async function getLatestScanBlob() {
  const filter = b => b.name.startsWith(`${getPrefix()}pharmacy-data-`) && b.name.endsWith(`${config.version}.json`);
  return azureService.getLatestBlob(filter);
}

async function getLatestSeedBlob() {
  const filter = b => b.name.startsWith(`${getPrefix()}pharmacy-seed-ids-`);
  return azureService.getLatestBlob(filter);
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

async function getTotalModifiedSincePages(lastScanDate) {
  const page = await syndicationService.getModifiedSincePage(lastScanDate, 1);
  return mapTotalPages(page);
}

function startPopulateRecordsFromIdsQueue() {
  const options = {
    workers: WORKERS,
    queueComplete: etlComplete,
    populateRecordAction: getPharmacy
  };
  populateRecordsFromIdsQueue.start(options);
}

async function clearUpdatedRecords() {
  const totalChangedPages = await getTotalModifiedSincePages(etlStore.getLastRunDate());
  log.info(`${totalChangedPages} pages of modified records since ${etlStore.getLastRunDate()}`);
  let changeCount = 0;
  for (let page = 1; page <= totalChangedPages; page++) {
    // eslint-disable-next-line no-await-in-loop
    const pageIds = await getModifiedOdsCodes(etlStore.getLastRunDate(), page);
    etlStore.addIds(pageIds);
    pageIds.forEach(etlStore.deleteRecord);
    changeCount += pageIds.length;
  }
  log.info(`${changeCount} records modified since ${etlStore.getLastRunDate()}`);
}

async function loadLatestEtlData() {
  const lastScan = await getLatestScanBlob();
  if (lastScan) {
    log.info(`Latest Scan data file retrieved '${lastScan.name}'`);
    await azureService.downloadFromAzure('./output/pharmacy-data.json', lastScan.name);
    fsHelper.loadJsonSync('pharmacy-data').map(etlStore.addRecord);
    return moment(lastScan.lastModified);
  }
  return undefined;
}

async function loadLatestIDList() {
  const seedBlob = await getLatestSeedBlob();
  if (seedBlob) {
    log.info(`Latest ID file retrieved '${seedBlob.name}'`);
    const seedTimestamp = getDate(seedBlob.name);
    const seedDate = moment(seedTimestamp, 'YYYYMMDD');
    etlStore.setLastRunDate(seedDate);
    await azureService.downloadFromAzure('./output/seed-ids.json', seedBlob.name);
    etlStore.addIds(fsHelper.loadJsonSync('seed-ids'));
    log.info(`Total IDs: ${etlStore.getIds().length}`);
  } else {
    throw Error('unable to retrieve ID list');
  }
}

async function smartEtl() {
  try {
    etlStore.clearState();
    await loadLatestIDList();
    await loadLatestEtlData();
    await clearUpdatedRecords();
    startPopulateRecordsFromIdsQueue();
  } catch (ex) {
    log.error(ex);
  }
}

module.exports = {
  start: smartEtl
};
