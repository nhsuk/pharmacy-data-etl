const etlStore = require('./etl-toolkit/etlStore');
const config = require('./config');
const syndicationService = require('./syndicationService');
const mapTotalPages = require('./mappers/mapTotalPages');
const populateIdListQueue = require('./etl-toolkit/queues/populateIds');
const populateRecordsFromIdsQueue = require('./etl-toolkit/queues/populateRecordsFromIds');
const getModifiedOdsCodes = require('./actions/getModifiedOdsCodes');
const getPharmacy = require('./actions/getPharmacy');
const log = require('./logger');

const RECORD_KEY = 'identifier';
const WORKERS = 1;
let resolvePromise;
let dataService;

etlStore.setIdKey(RECORD_KEY);

function clearState() {
  populateIdListQueue.clearState();
  etlStore.clearState();
}

async function etlComplete() {
  etlStore.saveRecords();
  etlStore.saveSummary();
  await dataService.uploadData();
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
  const { data, date } = await dataService.getLatestData(config.version);
  if (etlStore.getLastRunDate() > date) {
    etlStore.setLastRunDate(date);
  }
  data.map(etlStore.addRecord);
}

async function loadLatestIDList() {
  const { ids, date } = await dataService.getLatestIds();
  etlStore.setLastRunDate(date);
  etlStore.addIds(ids);
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
  start
};
