const async = require('async');

const etlStore = require('../etlStore');
const log = require('../../logger');
const fsHelper = require('../../fsHelper');

let getIdsAction;
let processedPages = {};

function pageDone(pageNo) {
  processedPages[pageNo] = true;
}

function saveState() {
  etlStore.saveState();
  fsHelper.saveJsonSync(processedPages, 'processedPages');
}

function clearState() {
  processedPages = {};
  fsHelper.saveJsonSync(processedPages, 'processedPages');
}

function loadState() {
  // there is a possibility that the same page will be processed twice
  // if the ETL is cancelled between adding the IDs to the etlStore, and
  // setting the processedPages. Duplicate IDs in the list will be ignored in the next queue
  // so this will not cause problems
  processedPages = fsHelper.loadJsonSync('processedPages') || {};
}

function handleError(err, pageNo) {
  log.error(`Error processing page ${pageNo}: ${err}`);
}

function loadPage(pageNo) {
  return getIdsAction(pageNo)
    .then(etlStore.addIds)
    .then(() => pageDone(pageNo))
    .catch(err => handleError(err, pageNo));
}

function pageParsed(pageNo) {
  return processedPages[pageNo] === true;
}

function processQueueItem(task, callback) {
  if (pageParsed(task.pageNo)) {
    log.info(`skipping ${task.pageNo}, already parsed`);
    callback();
  } else {
    log.info(`loading page ${task.pageNo}`);
    loadPage(task.pageNo).then(callback);
  }
}

function addPageToQueue(q, pageNo) {
  q.push({ pageNo }, () => log.info(`${pageNo} done`));
}

function start(options) {
  getIdsAction = options.getIdsAction;
  const q = async.queue(processQueueItem, options.workers);

  q.drain = () => {
    saveState();
    options.queueComplete();
  };

  for (let i = 1; i <= options.totalPages; i++) {
    addPageToQueue(q, i);
  }
}

loadState();

module.exports = {
  start,
  clearState,
};
