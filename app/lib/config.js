const version = require('../../package').version;

const outputFile = 'pharmacy-data';

module.exports = {
  cacheDataFilename: 'cache-data.json',
  cacheIdFilename: 'cache-ids.json',
  containerName: process.env.CONTAINER_NAME || 'etl-output',
  dateStampFormat: 'YYYYMMDD',
  hitsPerHour: process.env.HITS_PER_HOUR || 20000,
  orgApiUrl: 'https://api.nhs.uk/organisations',
  outputDir: './output',
  outputFile,
  outputFilename: `${outputFile}.json`,
  processedPagesFilename: 'processed-pages.json',
  saveEvery: 100,
  seedIdFile: 'pharmacy-seed-ids',
  summaryFilename: 'summary.json',
  syndicationApiUrl: 'https://v1.syndication.nhschoices.nhs.uk/organisations/pharmacies',
  version,
};
