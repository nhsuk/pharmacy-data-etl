// const log = require('../logger');
const fsHelper = require('../fsHelper');

const ALL_TYPE = 'all';
const SERVICES_TYPE = 'services';
const FACILITIES_TYPE = 'facilities';

let ids = [];
let failedIds = {};
let cache = {};

// function getGPs() {
//   return Object.values(cache);
// }

// function getGP(syndicationId) {
//   return cache[syndicationId];
// }

function getIds() {
  return ids;
}

function getFailedIds() {
  return Object.keys(failedIds).map(n => Number(n));
}

function getFailedIdsByType(type) {
  const failures = [];
  Object.keys(failedIds).forEach((key) => {
    if (failedIds[key][type]) {
      failures.push(Number(key));
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

// function addGP(gp) {
//   cache[gp.syndicationId] = gp;
//   return gp;
// }

function addFailedId(id, area, message) {
  const failedId = failedIds[id] || {};
  failedId[area] = message;
  failedIds[id] = failedId;
  return id;
}

function addIds(gpsList) {
  ids = ids.concat(gpsList);
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

// function writeSubpageStatus(type) {
//   const failedSubpageIds = getFailedIdsByType(type);
//   if (failedSubpageIds.length > 0) {
//     log.info(`${failedSubpageIds.length} have errors on the ${type} page`);
//   }
// }

// function writeStatus() {
//   const failedAllIds = getErorredIds();
//   log.info(`${failedAllIds.length} syndication IDs failed: ${failedAllIds}`);
//   writeSubpageStatus(FACILITIES_TYPE);
//   writeSubpageStatus(SERVICES_TYPE);
//   log.info('see summary.json file in \'site/json\' for full details');
// }

// function saveGPs() {
//   writeStatus();
//   fsHelper.saveJsonSync(getGPs(), 'gp-data');
// }

function saveSummary() {
  const summary = {
    totalScanned: ids.length,
    totalErroredIds: getErorredIds().length,
    totalFacilitiesMissing: getFailedIdsByType(FACILITIES_TYPE).length,
    totalServicesMissing: getFailedIdsByType(SERVICES_TYPE).length,
    lastWritten: (new Date()).toLocaleString(),
    failedIds,
  };
  fsHelper.saveJsonSync(summary, 'summary');
}

loadState();

module.exports = {
  getIds,
  addIds,
  // getGP,
  // addGP,
  // saveGPs,
  saveSummary,
  addFailedId,
  saveState,
  clearState,
  clearFailedIds,
  getFailedIds,
  getFailedIdsByType,
  getErorredIds,
};
