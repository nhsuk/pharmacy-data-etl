const etl = require('./app/lib/smartEtl');
const dataService = require('./app/lib/azureDataService');
const log = require('./app/lib/logger');

async function start() {
  try {
    await etl.start(dataService);
  } catch (ex) {
    log.error(ex);
  }
}

start();
