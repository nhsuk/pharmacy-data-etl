const version = require('../../package').version;

const config = {
  containerName: process.env.CONTAINER_NAME || 'etl-output',
  dateStampFormat: 'YYYYMMDD',
  hitsPerHour: process.env.HITS_PER_HOUR || 20000,
  idListFile: 'ids',
  orgApiUrl: 'https://api.nhs.uk/organisations',
  outputDir: './output',
  outputFile: 'pharmacy-data',
  saveEvery: 100,
  syndicationApiUrl: 'https://v1.syndication.nhschoices.nhs.uk/organisations/pharmacies',
  version,
};

module.exports = config;
