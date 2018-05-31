const moment = require('moment');
const requireEnv = require('require-environment-variables');
const fs = require('fs');
const EtlStore = require('etl-toolkit').EtlStore;

const config = require('./config');
const getModifiedOdsCodes = require('./actions/getModifiedOdsCodes');
const getPharmacy = require('./actions/getPharmacy');
const log = require('./logger');
const mapTotalPages = require('./mappers/mapTotalPages');
const PopulateRecordsQueue = require('etl-toolkit').queues.populateRecordsFromIds;
const syndicationService = require('./syndicationService');

const etlStore = new EtlStore({ idKey: config.idKey, log, outputFile: config.outputFile });

const populateRecordsFromIdsQueue = new PopulateRecordsQueue({
  etlStore,
  hitsPerHour: config.hitsPerHour,
  log,
  populateRecordAction: getPharmacy,
});

const WORKERS = 1;

let resolvePromise;
let dataService;
let startMoment;
let lastRunDate;

requireEnv(['OUTPUT_FILE']);

function clearState() {
  etlStore.clearState();
}

function logStatus() {
  log.info(`${etlStore.getErroredIds().length} errored records`);
}

function updateSeedIdsFromEtlStore() {
  const json = JSON.stringify(etlStore.getIds());
  fs.writeFileSync(dataService.localSeedIdFile, json, 'utf8');
}

async function etlComplete() {
  etlStore.saveRecords();
  updateSeedIdsFromEtlStore();
  etlStore.saveSummary();
  logStatus();
  await dataService.uploadData(startMoment);
  await dataService.uploadIds(startMoment);
  await dataService.uploadSummary(startMoment);
  if (resolvePromise) {
    resolvePromise();
  }
}

async function getTotalModifiedSincePages(lastScanDate) {
  const page = await syndicationService.getModifiedSincePage(lastScanDate, 1);
  return mapTotalPages(page);
}

function startRevisitFailuresQueue() {
  if (etlStore.getErroredIds().length > 0) {
    log.info('Revisiting failed IDs');
    const options = {
      queueComplete: etlComplete,
      workers: WORKERS,
    };
    populateRecordsFromIdsQueue.startRetryQueue(options);
  } else {
    etlComplete();
  }
}

function startPopulateRecordsFromIdsQueue() {
  const options = {
    queueComplete: startRevisitFailuresQueue,
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
  etlStore,
  start,
};
