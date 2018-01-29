const version = require('../../package').version;

const config = {
  version,
  hitsPerHour: process.env.HITS_PER_HOUR || 20000,
  saveEvery: 100,
  outputDir: './output',
  outputFile: 'pharmacy-data',
  containerName: process.env.CONTAINER_NAME || 'etl-output',
  orgApiUrl: 'https://api.nhs.uk/organisations',
  syndicationApiUrl: 'https://v1.syndication.nhschoices.nhs.uk/organisations/pharmacies',
};

module.exports = config;
