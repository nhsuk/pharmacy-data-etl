const version = require('../../package').version;

const outputFile = process.env.OUTPUT_FILE || 'pharmacy-data';
const seedIdFile = process.env.SEED_ID_FILE || 'pharmacy-seed-ids';

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
  seedIdFile,
  summaryFilename: 'summary.json',
  syndicationApiUrl: 'https://v1.syndication.nhschoices.nhs.uk/organisations/pharmacies',
  version,
};
