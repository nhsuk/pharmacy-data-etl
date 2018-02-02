const etl = require('./app/lib/smartEtl');
const dataService = require('./app/lib/azureDataService');

etl.start(dataService);
