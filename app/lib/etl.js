const requireEnv = require('require-environment-variables');

const etlStore = require('./etl-toolkit/etlStore');
const populateIdListQueue = require('./etl-toolkit/queues/populateIds');
const populateRecordsFromIdsQueue = require('./etl-toolkit/queues/populateRecordsFromIds');
const getOdsCodes = require('./actions/getOdsCodes');
const getPharmacy = require('./actions/getPharmacy');
const getTotalPages = require('./actions/getTotalPages');
const log = require('./logger');
const config = require('./config');

requireEnv(['SYNDICATION_API_KEY']);

const WORKERS = 1;
let etlInProgress = false;
function clearState() {
  populateIdListQueue.clearState();
  etlStore.clearState();
}

function handleError(err) {
  log.info(`processing failed: ${err}`);
}

function etlComplete() {
  etlStore.saveRecords();
  etlStore.saveSummary();
  clearState();
  etlInProgress = false;
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

function idQueueComplete() {
  log.info(`${etlStore.getIds().length} pharmacies found`);
  startPopulateRecordsFromIdsQueue();
}

function startIdQueue(totalPages) {
  const options = {
    totalPages,
    workers: WORKERS,
    queueComplete: idQueueComplete,
    getIdsAction: getOdsCodes,
  };
  populateIdListQueue.start(options);
}

function start() {
  if (process.argv[2] === 'small') {
    if (process.argv[3] === 'clear') {
      clearState();
    }
    // run with only a few pages, save every 10 records rather than 100
    config.saveEvery = 10;
    startIdQueue(3);
  } else {
    if (process.argv[2] === 'clear') {
      clearState();
    }
    getTotalPages().then(startIdQueue).catch(handleError);
  }

  process.on('SIGINT', () => {
    log.info('ETL cancelled');
    etlStore.saveState();
    process.exit();
  });
}

function safeStart() {
  if (etlInProgress) {
    log.error('Etl already running');
  } else {
    etlInProgress = true;
    start();
  }
}

module.exports = {
  start: safeStart,
};
