const requireEnv = require('require-environment-variables');

const etlStore = require('./app/lib/etl-toolkit/etlStore');
const populateIdListQueue = require('./app/lib/etl-toolkit/queues/populateIds');
// const populatePracticeQueue = require('./app/lib/queues/populatePracticeQueue');
const service = require('./app/lib/syndicationService');
const mapTotalPages = require('./app/lib/mappers/mapTotalPages');
const mapOdsCode = require('./app/lib/mappers/mapOdsCode');
const log = require('./app/lib/logger');
const config = require('./app/lib/config');

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

function getTotalPages() {
  return service.getPharmacyAllPage(1).then(mapTotalPages);
}

function idQueueComplete() {
  log.info(`${etlStore.getIds().length} pharmacies found`);
  // startPopulatePracticeQueue();
}

function getOdsCodes(pageNo) {
  return service.getPharmacyAllPage(pageNo)
    .then(mapOdsCode.fromResults);
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
