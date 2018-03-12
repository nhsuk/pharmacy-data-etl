const moment = require('moment');

const azureService = require('./azureService');
const config = require('./config');
const fsHelper = require('./fsHelper');
const getDateFromFilename = require('./getDateFromFilename');
const log = require('./logger');
const utils = require('./utils');

const idListFile = `${config.outputDir}/ids.json`;
const outputFile = `${config.outputDir}/${config.outputFile}.json`;
const summaryFile = `${config.outputDir}/summary.json`;

const dateStampFormat = config.dateStampFormat;

async function getLatestDataBlob(version) {
  const filter = b => b.name.startsWith(`${utils.getFilePrefix()}pharmacy-data-`) && b.name.endsWith(`${version}.json`);
  return azureService.getLatestBlob(filter);
}

async function getLatestSeedIdsBlob() {
  const filter = b => b.name.startsWith(`${utils.getFilePrefix()}pharmacy-seed-ids-`);
  return azureService.getLatestBlob(filter);
}

async function downloadLatestData(blobName, localName) {
  const downloadedFile = `./${config.outputDir}/${localName}.json`;
  log.info(`Latest version of '${localName}' file identified - '${blobName}'`);
  await azureService.downloadFromAzure(downloadedFile, blobName);
  log.info(`Remote '${blobName}' file downloaded locally - '${downloadedFile}'`);
  const fileDateStamp = getDateFromFilename(blobName);
  const date = moment(fileDateStamp, dateStampFormat);
  const data = fsHelper.loadJsonSync(localName);
  return { data, date };
}

async function getLatestIds() {
  const blob = await getLatestSeedIdsBlob();
  if (blob) {
    return downloadLatestData(blob.name, 'seed-ids');
  }
  throw Error('unable to retrieve ID list');
}

async function getLatestData(version) {
  const blob = await getLatestDataBlob(version);
  if (blob) {
    return downloadLatestData(blob.name, 'pharmacy-data');
  }
  log.info(`unable to retrieve data, no data available for release ${version}?`);
  return { data: [] };
}

function getDatestamp(startMoment) {
  return startMoment.format(dateStampFormat);
}

function getSuffix(startMoment) {
  return `-${getDatestamp(startMoment)}-${utils.getMajorMinorVersion()}.json`;
}

async function uploadData(startMoment) {
  log.info('Saving date stamped version of ID list in Azure');
  await azureService.uploadToAzure(idListFile, `${utils.getFilePrefix()}pharmacy-seed-ids-${getDatestamp(startMoment)}.json`);
  log.info(`Overwriting '${config.outputFile}' in Azure`);
  await azureService.uploadToAzure(outputFile, `${utils.getFilePrefix()}${config.outputFile}.json`);
  log.info(`Saving date stamped version of '${config.outputFile}' in Azure`);
  await azureService.uploadToAzure(outputFile, `${utils.getFilePrefix()}${config.outputFile}${getSuffix(startMoment)}`);
  log.info('Saving summary file in Azure');
  await azureService.uploadToAzure(summaryFile, `${utils.getFilePrefix()}summary${getSuffix(startMoment)}`);
}

module.exports = {
  getLatestData,
  getLatestIds,
  uploadData,
};
