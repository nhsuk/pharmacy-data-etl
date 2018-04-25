const moment = require('moment');

const etlStore = require('etl-toolkit').etlStore;
const getModifiedOdsCodes = require('./actions/getModifiedOdsCodes');
const getPharmacy = require('./actions/getPharmacy');
const log = require('./logger');
const config = require('./config');
const mapTotalPages = require('./mappers/mapTotalPages');
const populateRecordsFromIdsQueue = require('etl-toolkit').queues.populateRecordsFromIds;
const syndicationService = require('./syndicationService');

const RECORD_KEY = 'identifier';
const WORKERS = 1;

let resolvePromise;
let dataService;
let startMoment;
let lastRunDate;

etlStore.setIdKey(RECORD_KEY);

function clearState() {
  etlStore.clearState();
}

function logStatus() {
  log.info(`${etlStore.getErorredIds().length} errored records`);
}

async function etlComplete() {
  etlStore.saveRecords();
  etlStore.saveSummary();
  logStatus();
  await dataService.uploadData(startMoment);
  await dataService.uploadIds(`${config.outputDir}/${config.seedIdFile}.json`, startMoment);
  await dataService.uploadSummary(startMoment);
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

async function addNewRecords() {
  const totalChangedPages = await getTotalModifiedSincePages(lastRunDate);
  log.info(`${totalChangedPages} pages of modified records since ${lastRunDate}`);
  log.info('Looking for new records');
  const idsBefore = etlStore.getIds().length;
  for (let page = 1; page <= totalChangedPages; page++) {
  // for (let page = 1; page <= 2; page++) {
    // eslint-disable-next-line no-await-in-loop
    const modifiedOdsCodes = await getModifiedOdsCodes(lastRunDate, page);
    etlStore.addIds(modifiedOdsCodes);
  }
  log.info(`${etlStore.getIds().length - idsBefore} records added since ${lastRunDate}`);
}

async function loadLatestIDList() {
  const { data, date } = await dataService.getLatestIds();
  lastRunDate = date;
  etlStore.addIds(data);
  // etlStore.addIds(data.slice(0, 10));
  log.info(`Total IDs: ${etlStore.getIds().length}`);
}

async function smartEtl(dataServiceIn) {
  dataService = dataServiceIn;
  clearState();
  await loadLatestIDList();
  await addNewRecords();
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
