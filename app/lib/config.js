const version = require('../../package').version;

module.exports = {
  containerName: process.env.CONTAINER_NAME || 'etl-output',
  orgApiUrl: 'https://api.nhs.uk/organisations',
  outputDir: './output',
  outputFile: process.env.OUTPUT_FILE || 'pharmacy-data',
  syndicationApiUrl: 'https://v1.syndication.nhschoices.nhs.uk/organisations/pharmacies',
  version,
};
