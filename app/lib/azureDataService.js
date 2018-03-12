const moment = require('moment');

const azureService = require('./azureService');
const config = require('./config');
const fsHelper = require('./fsHelper');
const getDateFromFilename = require('./getDateFromFilename');
const log = require('./logger');
const utils = require('./utils');

const dateStampFormat = config.dateStampFormat;

async function getLatestDataBlob(version) {
  const filter = b => b.name.startsWith(`${utils.getFilePrefix()}pharmacy-data-`) && b.name.endsWith(`${version}.json`);
  return azureService.getLatestBlob(filter);
}

async function getLatestSeedIdsBlob() {
  const filter = b => b.name.startsWith(`${utils.getFilePrefix()}${config.seedIdFile}-`);
  return azureService.getLatestBlob(filter);
}

async function downloadLatestData(blobName, localFilename) {
  log.info(`Latest version of '${localFilename}' file identified as: '${blobName}'`);
  await azureService.downloadFromAzure(localFilename, blobName);
  log.info(`Remote file '${blobName}' downloaded locally as: '${localFilename}'`);
  const fileDateStamp = getDateFromFilename(blobName);
  const date = moment(fileDateStamp, dateStampFormat);
  const data = fsHelper.loadJsonSync(localFilename);
  return { data, date };
}

async function getLatestIds() {
  const blob = await getLatestSeedIdsBlob();
  if (blob) {
    return downloadLatestData(blob.name, `${config.seedIdFile}.json`);
  }
  throw Error('unable to retrieve ID list');
}

async function getLatestData(version) {
  const blob = await getLatestDataBlob(version);
  if (blob) {
    return downloadLatestData(blob.name, config.outputFilename);
  }
  log.info(`Unable to retrieve data, no data available for release ${version}?`);
  return { data: [] };
}

function getDatestamp(startMoment) {
  return startMoment.format(dateStampFormat);
}

function getSuffix(startMoment) {
  return `-${getDatestamp(startMoment)}-${utils.getMajorMinorVersion()}.json`;
}

async function uploadData(startMoment) {
  log.info(`Saving date stamped version of '${config.seedIdFile}' in Azure`);
  await azureService.uploadToAzure(config.cacheIdFilename, `${utils.getFilePrefix()}${config.seedIdFile}-${getDatestamp(startMoment)}.json`);
  log.info(`Overwriting '${config.outputFilename}' in Azure`);
  await azureService.uploadToAzure(config.outputFilename, `${utils.getFilePrefix()}${config.outputFilename}`);
  log.info(`Saving date stamped version of '${config.outputFilename}' in Azure`);
  await azureService.uploadToAzure(config.outputFilename, `${utils.getFilePrefix()}${config.outputFile}${getSuffix(startMoment)}`);
  log.info(`Saving '${config.summaryFilename}' file in Azure`);
  await azureService.uploadToAzure(config.summaryFilename, `${utils.getFilePrefix()}summary${getSuffix(startMoment)}`);
}

module.exports = {
  getLatestData,
  getLatestIds,
  uploadData,
};
