const requireEnv = require('require-environment-variables');
// requireEnvs must be at the top of the file as the azure-storage module uses the
// AZURE_STORAGE_CONNECTION_STRING variable on load
requireEnv(['SYNDICATION_API_KEY']);
requireEnv(['AZURE_STORAGE_CONNECTION_STRING']);

const etlStore = require('./etl-toolkit/etlStore');
const populateRecordsFromIdsQueue = require('./etl-toolkit/queues/populateRecordsFromIds');
const getPharmacy = require('./actions/getPharmacy');
const uploadOutputToAzure = require('./uploadOutputToAzure');
const log = require('./logger');
const config = require('./config');
const seedIds = require('../../resources/seed-ids');

const WORKERS = 1;
const RECORD_KEY = 'identifier';
let etlInProgress = false;
let resolvePromise;

etlStore.setIdKey(RECORD_KEY);

function clearState() {
  etlStore.clearState();
}

async function etlComplete() {
  etlStore.saveRecords();
  etlStore.saveSummary();
  await uploadOutputToAzure();
  clearState();
  etlInProgress = false;
  if (resolvePromise) {
    resolvePromise();
  }
}

function startRevisitFailuresQueue() {
  if (etlStore.getErorredIds().length > 0) {
    log.info('Revisiting failed IDs');
    const options = {
      workers: WORKERS,
      queueComplete: etlComplete,
      populateRecordAction: getPharmacy,
    };
    populateRecordsFromIdsQueue.startRetryQueue(options);
  } else {
    etlComplete();
  }
}

function startPopulateRecordsFromIdsQueue() {
  const options = {
    workers: WORKERS,
    queueComplete: startRevisitFailuresQueue,
    populateRecordAction: getPharmacy,
  };
  populateRecordsFromIdsQueue.start(options);
}

function startPopulateQueue(ids) {
  etlStore.addIds(ids);
  startPopulateRecordsFromIdsQueue();
}

function start() {
  if (process.argv[2] === 'small') {
    if (process.argv[3] === 'clear') {
      clearState();
    }
    // run with only 20 records, save every 10 records rather than 100
    config.saveEvery = 10;
    startPopulateQueue(seedIds.slice(0, 20));
  } else {
    if (process.argv[2] === 'clear') {
      clearState();
    }
    startPopulateQueue(seedIds);
  }

  process.on('SIGINT', () => {
    log.info('ETL cancelled');
    etlStore.saveState();
    process.exit();
  });
}

function safeStart() {
  return new Promise((resolve, reject) => {
    if (etlInProgress) {
      log.error('Etl already running');
      reject();
    } else {
      etlInProgress = true;
      start();
      resolvePromise = () => {
        resolve();
      };
    }
  });
}

module.exports = {
  start: safeStart,
};
