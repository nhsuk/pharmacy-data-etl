const AzureDataService = require('azure-data-service');
const config = require('./config');
const log = require('./logger');
const utils = require('./utils');

const version = utils.getMajorMinorVersion();
const outputDir = config.outputDir;
const outputFile = config.outputFile;
const containerName = config.containerName;
const seedIdFile = config.seedIdFile;

const azureDataService = new AzureDataService({
  containerName,
  log,
  outputDir,
  outputFile,
  seedIdFile,
  version,
});

module.exports = azureDataService;
