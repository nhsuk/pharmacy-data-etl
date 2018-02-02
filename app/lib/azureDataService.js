
const moment = require('moment');
const fsHelper = require('./fsHelper');
const azureService = require('./azureService');
const utils = require('./utils');
const log = require('./logger');
const config = require('./config');

const outputFile = `${config.outputDir}/${config.outputFile}.json`;
const idListFile = `${config.outputDir}/ids.json`;

const datePattern = /.*pharmacy-seed-ids-(\d+).json/i;

function getDate(filename) {
  const match = datePattern.exec(filename);
  if (match && match.length === 2) {
    return match[1];
  }
  return undefined;
}

async function getLatestScanBlob(version) {
  const filter = b => b.name.startsWith(`${utils.getFilePrefix()}pharmacy-data-`) && b.name.endsWith(`${version}.json`);
  return azureService.getLatestBlob(filter);
}

async function getLatestSeedBlob() {
  const filter = b => b.name.startsWith(`${utils.getFilePrefix()}pharmacy-seed-ids-`);
  return azureService.getLatestBlob(filter);
}

async function getLatestIds() {
  const seedBlob = await getLatestSeedBlob();
  if (seedBlob) {
    log.info(`Latest ID file retrieved '${seedBlob.name}'`);
    const seedTimestamp = getDate(seedBlob.name);
    const date = moment(seedTimestamp, 'YYYYMMDD');
    await azureService.downloadFromAzure('./output/seed-ids.json', seedBlob.name);
    const ids = fsHelper.loadJsonSync('seed-ids');
    return { ids, date };
  }
  throw Error('unable to retrieve ID list');
}

async function getLatestData(version) {
  const lastScan = await getLatestScanBlob(version);
  if (lastScan) {
    log.info(`Latest Scan data file retrieved '${lastScan.name}'`);
    await azureService.downloadFromAzure('./output/pharmacy-data.json', lastScan.name);
    const data = fsHelper.loadJsonSync('pharmacy-data');
    const date = moment(lastScan.lastModified);
    return { data, date };
  }
  log.info('unable to retrieve data');
  return { data: [] };
}

function getDatestamp() {
  return moment().format('YYYYMMDD');
}

function getSuffix() {
  return `-${getDatestamp()}-${config.version}.json`;
}

async function uploadData() {
  log.info('Saving date stamped version of ID list in Azure');
  await azureService.uploadToAzure(idListFile, `${utils.getFilePrefix()}pharmacy-seed-ids-${getDatestamp()}.json`);
  log.info(`Overwriting '${config.outputFile}' in Azure`);
  await azureService.uploadToAzure(outputFile, `${utils.getFilePrefix()}${config.outputFile}.json`);
  log.info(`Saving date stamped version of '${config.outputFile}' in Azure`);
  await azureService.uploadToAzure(outputFile, `${utils.getFilePrefix()}${config.outputFile}${getSuffix()}`);
}

module.exports = {
  getLatestIds,
  getLatestData,
  uploadData
};
