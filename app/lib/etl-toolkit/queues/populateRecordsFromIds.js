const async = require('async');

const log = require('../../logger');
const etlStore = require('../etlStore');
const limiter = require('../limiter');
const config = require('../../config');

let populateRecordFromIdAction;
let hitsPerWorker;
let count = 0;
let retryCount = 0;
let totalRetries = 0;

function handleError(err, id) {
  etlStore.addFailedId(id, etlStore.ALL_TYPE, err.message);
  log.error(`Error processing ID ${id}: ${err}`);
}

function populateData(id) {
  return populateRecordFromIdAction(id)
    .then(etlStore.addRecord)
    .catch(err => handleError(err, id));
}

function pageParsed(id) {
  return etlStore.getRecord(id);
}

function savePeriodically() {
  if (count % config.saveEvery === 0) {
    etlStore.saveState();
  }
}

function processQueueItem(task, callback) {
  count += 1;
  if (pageParsed(task.id)) {
    callback(false);
  } else {
    savePeriodically();
    log.info(`Populating ID ${task.id} ${count}/${etlStore.getIds().length}`);
    limiter(hitsPerWorker, () => populateData(task.id), () => callback(true));
  }
}
function processRetryQueueItem(task, callback) {
  retryCount += 1;
  log.info(`Retrying ID ${task.id} ${retryCount}/${totalRetries}`);
  limiter(hitsPerWorker, () => populateData(task.id), callback);
}

function writeDoneLog(id, writeLog) {
  if (writeLog) {
    log.info(`${id} done`);
  }
}

function addToQueue(ids, q) {
  // remove 'undefined's
  ids.filter(id => id).forEach((id) => {
    q.push({ id }, writeLog => writeDoneLog(id, writeLog));
  });
}

function queueIds(q) {
  addToQueue(etlStore.getIds(), q);
}
function queueErroredIds(q) {
  const failedIds = etlStore.getErorredIds();
  totalRetries = failedIds.length;
  etlStore.clearFailedIds(failedIds);
  addToQueue(failedIds, q);
}

function setHitsPerWorker(options) {
  hitsPerWorker = config.hitsPerHour / (options.workers * (options.numberOfSteps || 1));
}

function startRetryQueue(options) {
  retryCount = 0;
  populateRecordFromIdAction = options.populateRecordAction;
  setHitsPerWorker(options);
  const q = async.queue(processRetryQueueItem, options.workers);
  queueErroredIds(q);
  q.drain = () => {
    etlStore.saveState();
    options.queueComplete();
  };
}

function start(options) {
  count = 0;
  if (etlStore.getIds().length > 0) {
    populateRecordFromIdAction = options.populateRecordAction;
    setHitsPerWorker(options);
    const q = async.queue(processQueueItem, options.workers);
    queueIds(q);
    q.drain = () => {
      etlStore.saveState();
      options.queueComplete();
    };
  } else {
    options.queueComplete();
  }
}

module.exports = {
  start,
  startRetryQueue,
};
