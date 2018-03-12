const log = require('../logger');
const fsHelper = require('../fsHelper');
const config = require('../config');

const ALL_TYPE = 'all';

let cache = {};
let failedIds = {};
let idKey = '_id';
let ids = [];
let lastRunDate;
let modifiedIds = [];

function setModifiedIds(modified) {
  modifiedIds = modifiedIds.concat(modified);
}

function setLastRunDate(date) {
  lastRunDate = date;
}

function getLastRunDate() {
  return lastRunDate;
}

function setIdKey(key) {
  idKey = key;
}

function getRecordId(record) {
  return record[idKey];
}

function addRecord(record) {
  cache[getRecordId(record)] = record;
  return record;
}

function deleteRecord(id) {
  delete cache[id];
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

function clearIds() {
  ids = [];
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

function addIfNew(id) {
  if (ids.indexOf(id) < 0) {
    ids.push(id);
  }
}

function addIds(idList) {
  idList.map(addIfNew);
  return ids;
}

function saveState() {
  fsHelper.saveJsonSync(ids, config.cacheIdFilename);
  fsHelper.saveJsonSync(cache, config.cacheDataFilename);
}

function clearState() {
  ids = [];
  cache = {};
  lastRunDate = undefined;
  clearFailedIds();
  saveState();
}

function loadState() {
  ids = fsHelper.loadJsonSync(config.cacheIdFilename) || [];
  cache = fsHelper.loadJsonSync(config.cacheDataFilename) || {};
}

function writeStatus() {
  const failedAllIds = getErorredIds();
  log.info(`${failedAllIds.length} IDs failed: ${failedAllIds}`);
  log.info(`See ${config.summaryFilename} for full details`);
}

function saveRecords() {
  writeStatus();
  fsHelper.saveJsonSync(getRecords(), config.outputFilename);
  fsHelper.saveJsonSync(getIds(), config.cacheIdFilename);
}

function saveSummary() {
  const summary = {
    lastWritten: (new Date()).toLocaleString(),
    totalScanned: ids.length,
    totalModified: modifiedIds.length,
    totalErrored: getErorredIds().length,
    totalFailed: failedIds.length,
    modifiedIds,
    erroredIds: getErorredIds(),
    failedIds,
  };
  fsHelper.saveJsonSync(summary, config.summaryFilename);
}

loadState();

module.exports = {
  ALL_TYPE,
  addFailedId,
  addIds,
  addRecord,
  clearFailedIds,
  clearIds,
  clearState,
  deleteRecord,
  getErorredIds,
  getFailedIds,
  getFailedIdsByType,
  getIds,
  getLastRunDate,
  getRecord,
  getRecords,
  saveRecords,
  saveState,
  saveSummary,
  setIdKey,
  setLastRunDate,
  setModifiedIds,
};
