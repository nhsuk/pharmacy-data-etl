const requireEnv = require('require-environment-variables');
const moment = require('moment');
// requireEnvs must be at the top of the file as the azure-storage module uses the
// AZURE_STORAGE_CONNECTION_STRING variable on load
requireEnv(['SYNDICATION_API_KEY']);
requireEnv(['AZURE_STORAGE_CONNECTION_STRING']);

const etlStore = require('./etl-toolkit/etlStore');
const fsHelper = require('./fsHelper');
const service = require('./syndicationService');
const mapTotalPages = require('./mappers/mapTotalPages');
const populateIdListQueue = require('./etl-toolkit/queues/populateIds');
const populateRecordsFromIdsQueue = require('./etl-toolkit/queues/populateRecordsFromIds');
const getModifiedOdsCodes = require('./actions/getModifiedOdsCodes');
const getPharmacy = require('./actions/getPharmacy');
const uploadOutputToAzure = require('./uploadOutputToAzure');
const log = require('./logger');

const WORKERS = 1;
const RECORD_KEY = 'identifier';
let resolvePromise;

etlStore.setIdKey(RECORD_KEY);

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
    populateRecordAction: getPharmacy,
    alwaysOverwrite: true
  };
  populateRecordsFromIdsQueue.start(options);
}

function idQueueComplete() {
  log.info(`${etlStore.getIds().length} pharmacies found`);
  const missing = ['FAJ87', 'FP519', 'FTG16'];
  log.info(`adding missing IDs ${missing}`);
  etlStore.addIds(missing);
  startPopulateRecordsFromIdsQueue();
}

function startIdQueue(lastScanDate, totalPages) {
  const options = {
    totalPages,
    workers: WORKERS,
    queueComplete: idQueueComplete,
    getIdsAction: id => getModifiedOdsCodes(lastScanDate, id),
  };
  populateIdListQueue.start(options);
}

async function getTotalPages(lastScanDate) {
  const page = await service.getModifiedSincePage(lastScanDate, 1);
  return mapTotalPages(page);
}

function loadLastScan() {
  const lastScan = fsHelper.loadJsonSync('seed-pharmacies');
  lastScan.forEach(etlStore.addRecord);
}

async function start() {
  clearState();
  const lastScanDate = moment('2018-01-26');
  loadLastScan();
  const totalChangedPages = await getTotalPages(lastScanDate);
  startIdQueue(lastScanDate, totalChangedPages);

  process.on('SIGINT', () => {
    log.info('ETL cancelled');
    etlStore.saveState();
    process.exit();
  });
}

module.exports = {
  start,
};
