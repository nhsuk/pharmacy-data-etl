
const moment = require('moment');
const fsHelper = require('./fsHelper');
const azureService = require('./azureService');
const utils = require('./utils');
const log = require('./logger');
const config = require('./config');

const outputFile = `${config.outputDir}/${config.outputFile}.json`;
const idListFile = `${config.outputDir}/ids.json`;
const summaryFile = `${config.outputDir}/summary.json`;

const datePattern = /(\d+).*pharmacy-seed-ids.json/i;

function getDate(filename) {
  const match = datePattern.exec(filename);
  if (match && match.length === 2) {
    return match[1];
  }
  return undefined;
}

async function getLatestDataBlob(version) {
  const filter = b => b.name.endsWith(`${utils.getEnvPrefix()}pharmacy-data-${version}.json`);
  return azureService.getLatestBlob(filter);
}

async function getLatestSeedIdsBlob() {
  const filter = b => b.name.endsWith(`${utils.getEnvPrefix()}pharmacy-seed-ids.json`);
  return azureService.getLatestBlob(filter);
}

async function getLatestIds() {
  const seedBlob = await getLatestSeedIdsBlob();
  if (seedBlob) {
    log.info(`Latest Pharmacy seed IDs file retrieved '${seedBlob.name}'`);
    const seedTimestamp = getDate(seedBlob.name);
    const date = moment(seedTimestamp, 'YYYYMMDD');
    await azureService.downloadFromAzure('./output/seed-ids.json', seedBlob.name);
    const ids = fsHelper.loadJsonSync('seed-ids');
    return { ids, date };
  }
  throw Error('unable to retrieve ID list');
}

async function getLatestData(version) {
  const lastScan = await getLatestDataBlob(version);
  if (lastScan) {
    log.info(`Latest pharmacy data file '${lastScan.name}' identified`);
    await azureService.downloadFromAzure('./output/pharmacy-data.json', lastScan.name);
    log.info(`Latest pharmacy data file '${lastScan.name}' downloaded`);
    const data = fsHelper.loadJsonSync('pharmacy-data');
    const date = moment(lastScan.lastModified);
    return { data, date };
  }
  log.info(`unable to retrieve data, no data available for release ${version}?`);
  return { data: [] };
}

function getSuffix() {
  return `-${config.version}.json`;
}

async function uploadData() {
  const prefix = utils.getFilePrefix();
  log.info('Saving date stamped version of ID list in Azure');
  await azureService.uploadToAzure(idListFile, `${prefix}pharmacy-seed-ids.json`);
  log.info(`Overwriting '${config.outputFile}' in Azure`);
  await azureService.uploadToAzure(outputFile, `${utils.getEnvPrefix()}${config.outputFile}.json`);
  log.info(`Saving date stamped version of '${config.outputFile}' in Azure`);
  await azureService.uploadToAzure(outputFile, `${prefix}${config.outputFile}${getSuffix()}`);
  log.info('Saving summary file in Azure');
  await azureService.uploadToAzure(summaryFile, `${prefix}summary${getSuffix()}`);
}

module.exports = {
  getLatestIds,
  getLatestData,
  uploadData
};
