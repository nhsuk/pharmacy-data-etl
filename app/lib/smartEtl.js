const moment = require('moment');

const etlStore = require('./etl-toolkit/etlStore');
const getModifiedOdsCodes = require('./actions/getModifiedOdsCodes');
const getPharmacy = require('./actions/getPharmacy');
const log = require('./logger');
const mapTotalPages = require('./mappers/mapTotalPages');
const populateIdListQueue = require('./etl-toolkit/queues/populateIds');
const populateRecordsFromIdsQueue = require('./etl-toolkit/queues/populateRecordsFromIds');
const syndicationService = require('./syndicationService');
const utils = require('./utils');

const RECORD_KEY = 'identifier';
const WORKERS = 1;

let resolvePromise;
let dataService;
let startMoment;

etlStore.setIdKey(RECORD_KEY);

function clearState() {
  populateIdListQueue.clearState();
  etlStore.clearState();
}

function logStatus() {
  log.info(`${utils.getDuplicates(etlStore.getIds()).length} duplicate ID`);
  log.info(`${etlStore.getFailedIds().length} errored records`);
}

async function etlComplete() {
  etlStore.saveRecords();
  etlStore.saveSummary();
  logStatus();
  await dataService.uploadData(startMoment);
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
    populateRecordAction: getPharmacy,
    queueComplete: etlComplete,
    workers: WORKERS,
  };
  populateRecordsFromIdsQueue.start(options);
}

async function clearUpdatedRecords() {
  const totalChangedPages = await getTotalModifiedSincePages(etlStore.getLastRunDate());
  log.info(`${totalChangedPages} pages of modified records since ${etlStore.getLastRunDate()}`);
  let changeCount = 0;
  for (let page = 1; page <= totalChangedPages; page++) {
    // eslint-disable-next-line no-await-in-loop
    const modifiedOdsCodes = await getModifiedOdsCodes(etlStore.getLastRunDate(), page);
    etlStore.addIds(modifiedOdsCodes);
    etlStore.setModifiedIds(modifiedOdsCodes);
    modifiedOdsCodes.forEach(etlStore.deleteRecord);
    changeCount += modifiedOdsCodes.length;
  }
  log.info(`${changeCount} records modified since ${etlStore.getLastRunDate()}`);
}

async function loadLatestEtlData() {
  const { data, date } = await dataService.getLatestData(utils.getMajorMinorVersion());
  if (etlStore.getLastRunDate() > date) {
    etlStore.setLastRunDate(date);
  }
  data.map(etlStore.addRecord);
}

async function loadLatestIDList() {
  const { data, date } = await dataService.getLatestIds();
  etlStore.setLastRunDate(date);
  etlStore.addIds(data);
  log.info(`Total IDs: ${etlStore.getIds().length}`);
}

async function smartEtl(dataServiceIn) {
  dataService = dataServiceIn;
  clearState();
  await loadLatestIDList();
  await loadLatestEtlData();
  await clearUpdatedRecords();
  startPopulateRecordsFromIdsQueue();
}

function start(dataServiceIn) {
  startMoment = moment();
  return new Promise((resolve, reject) => {
    try {
      smartEtl(dataServiceIn);
    } catch (ex) {
      log.error(ex);
      reject(ex);
    }
    resolvePromise = () => {
      resolve();
    };
  });
}

module.exports = {
  start,
};
