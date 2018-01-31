const moment = require('moment');
const azureService = require('./azureService');
const config = require('./config');
const log = require('./logger');

const outputFile = `${config.outputDir}/${config.outputFile}.json`;
const idListFile = `${config.outputDir}/ids.json`;

function getPrefix() {
  // prevent dev from over-writing production azure blob
  return process.env.NODE_ENV === 'production' ? '' : 'dev-';
}

function getDatestamp() {
  return moment().format('YYYYMMDD');
}

function getSuffix() {
  return `-${getDatestamp()}-${config.version}.json`;
}

async function uploadOutputToAzure() {
  log.info('Saving date stamped version of ID list in Azure');
  await azureService.uploadToAzure(idListFile, `${getPrefix()}pharmacy-seed-ids-${getDatestamp()}.json`);
  log.info(`Overwriting '${config.outputFile}' in Azure`);
  await azureService.uploadToAzure(outputFile, `${getPrefix()}${config.outputFile}.json`);
  log.info(`Saving date stamped version of '${config.outputFile}' in Azure`);
  await azureService.uploadToAzure(outputFile, `${getPrefix()}${config.outputFile}${getSuffix()}`);
}

module.exports = uploadOutputToAzure;
