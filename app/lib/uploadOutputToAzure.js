const azureService = require('./azureService');
const config = require('./config');
const log = require('./logger');

const outputFile = `${config.outputDir}/${config.outputFile}.json`;

function getPrefix() {
  // prevent dev from over-writing production azure blob
  return process.env.NODE_ENV === 'production' ? '' : 'dev-';
}

function getDatestamp() {
  const today = new Date();
  return `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`;
}

async function uploadOutputToAzure() {
  log.info(`Overwriting '${config.outputFile}' in Azure`);
  await azureService.uploadToAzure(outputFile, `${getPrefix()}${config.outputFile}.json`);
  log.info(`Saving date stamped version of '${config.outputFile}' in Azure`);
  return azureService.uploadToAzure(outputFile, `${getPrefix()}${config.outputFile}-${getDatestamp()}.json`);
}

module.exports = uploadOutputToAzure;
