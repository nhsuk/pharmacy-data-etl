const azureService = require('./azureService');
const config = require('./config');
const fsHelper = require('./fsHelper');
const log = require('./logger');
const moment = require('moment');
const utils = require('./utils');

const outputFile = `${config.outputDir}/${config.outputFile}.json`;
const idListFile = `${config.outputDir}/ids.json`;
const summaryFile = `${config.outputDir}/summary.json`;

function getDate(filename, regex) {
  const match = regex.exec(filename);
  if (match && match.length === 2) {
    return match[1];
  }
  return undefined;
}

async function getLatestDataBlob(version) {
  const filter = b => b.name.startsWith(`${utils.getFilePrefix()}pharmacy-data-`) && b.name.endsWith(`${version}.json`);
  return azureService.getLatestBlob(filter);
}

async function getLatestSeedIdsBlob() {
  const filter = b => b.name.startsWith(`${utils.getFilePrefix()}pharmacy-seed-ids-`);
  return azureService.getLatestBlob(filter);
}

async function getLatestIds() {
  const blob = await getLatestSeedIdsBlob();
  if (blob) {
    log.info(`Latest pharmacy seed ids file '${blob.name}' identified`);
    await azureService.downloadFromAzure('./output/seed-ids.json', blob.name);
    log.info(`Latest pharmacy seed ids file '${blob.name}' downloaded`);
    const dateRegex = /.*pharmacy-seed-ids-(\d+).json/i;
    const fileDateStamp = getDate(blob.name, dateRegex);
    const date = moment(fileDateStamp, 'YYYYMMDD');
    const data = fsHelper.loadJsonSync('seed-ids');
    return { data, date };
  }
  throw Error('unable to retrieve ID list');
}

async function getLatestData(version) {
  const blob = await getLatestDataBlob(version);
  if (blob) {
    log.info(`Latest pharmacy data file '${blob.name}' identified`);
    await azureService.downloadFromAzure('./output/pharmacy-data.json', blob.name);
    log.info(`Latest pharmacy data file '${blob.name}' downloaded`);
    const dateRegex = /.*pharmacy-data-(\d+)-\d+.\d+.json/i;
    const fileDateStamp = getDate(blob.name, dateRegex);
    const date = moment(fileDateStamp, 'YYYYMMDD');
    const data = fsHelper.loadJsonSync('pharmacy-data');
    return { data, date };
  }
  log.info(`unable to retrieve data, no data available for release ${version}?`);
  return { data: [] };
}

function getDatestamp() {
  return moment().format('YYYYMMDD');
}

function getSuffix() {
  return `-${getDatestamp()}-${utils.getMajorMinorVersion()}.json`;
}

async function uploadData() {
  log.info('Saving date stamped version of ID list in Azure');
  await azureService.uploadToAzure(idListFile, `${utils.getFilePrefix()}pharmacy-seed-ids-${getDatestamp()}.json`);
  log.info(`Overwriting '${config.outputFile}' in Azure`);
  await azureService.uploadToAzure(outputFile, `${utils.getFilePrefix()}${config.outputFile}.json`);
  log.info(`Saving date stamped version of '${config.outputFile}' in Azure`);
  await azureService.uploadToAzure(outputFile, `${utils.getFilePrefix()}${config.outputFile}${getSuffix()}`);
  log.info('Saving summary file in Azure');
  await azureService.uploadToAzure(summaryFile, `${utils.getFilePrefix()}summary${getSuffix()}`);
}

module.exports = {
  getLatestData,
  getLatestIds,
  uploadData
};
