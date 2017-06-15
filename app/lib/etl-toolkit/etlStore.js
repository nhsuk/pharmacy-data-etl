const log = require('../logger');
const fsHelper = require('../fsHelper');
const config = require('../config');

const ALL_TYPE = 'all';

let ids = [];
let failedIds = {};
let cache = {};
let idKey = '_id';

function setIdKey(key) {
  idKey = key;
}

function getRecordId(record) {
  return record[idKey];
}

function addRecord(record) {
  // eslint-disable-next-line no-underscore-dangle
  cache[getRecordId(record)] = record;
  return record;
}

function getRecords() {
  return Object.values(cache);
}

function getRecord(id) {
  return cache[id];
}

function getIds() {
  return ids;
}

function getFailedIds() {
  return Object.keys(failedIds);
}

function getFailedIdsByType(type) {
  const failures = [];
  Object.keys(failedIds).forEach((key) => {
    if (failedIds[key][type]) {
      failures.push(key);
    }
  });
  return failures;
}

function getErorredIds() {
  return getFailedIdsByType(ALL_TYPE);
}

function clearFailedIds(failures) {
  if (failures) {
    failures.forEach(id => delete failedIds[id]);
  } else {
    failedIds = {};
  }
}

function addFailedId(id, area, message) {
  const failedId = failedIds[id] || {};
  failedId[area] = message;
  failedIds[id] = failedId;
  return id;
}

function addIds(idList) {
  ids = ids.concat(idList);
  return ids;
}

function saveState() {
  fsHelper.saveJsonSync(ids, 'ids');
  fsHelper.saveJsonSync(cache, 'cache');
}

function clearState() {
  ids = [];
  cache = {};
  clearFailedIds();
  saveState();
}

function loadState() {
  ids = fsHelper.loadJsonSync('ids') || [];
  cache = fsHelper.loadJsonSync('cache') || {};
}

function writeStatus() {
  const failedAllIds = getErorredIds();
  log.info(`${failedAllIds.length} IDs failed: ${failedAllIds}`);
  log.info(`see summary.json file in '${config.outputDir}' for full details`);
}

function saveRecords() {
  writeStatus();
  fsHelper.saveJsonSync(getRecords(), config.outputFile);
}

function saveSummary() {
  const summary = {
    totalScanned: ids.length,
    totalErroredIds: getErorredIds().length,
    lastWritten: (new Date()).toLocaleString(),
    failedIds,
  };
  fsHelper.saveJsonSync(summary, 'summary');
}

loadState();

module.exports = {
  ALL_TYPE,
  setIdKey,
  getIds,
  addIds,
  getRecord,
  getRecords,
  addRecord,
  saveRecords,
  saveSummary,
  addFailedId,
  saveState,
  clearState,
  clearFailedIds,
  getFailedIds,
  getFailedIdsByType,
  getErorredIds,
};
