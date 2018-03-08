const schedule = require('node-schedule');

const log = require('./app/lib/logger');
const scheduleConfig = require('./app/lib/scheduleConfig');
const etl = require('./app/lib/smartEtl');
const dataService = require('./app/lib/azureDataService');

const nodeEnv = process.env.NODE_ENV;

log.info(`NODE_ENV set to ${nodeEnv}.`);
if (nodeEnv === 'production') {
  log.info('Running in production mode with a schedule');
  log.info(`Scheduling job with rule '${scheduleConfig.getSchedule()}'`);
  schedule.scheduleJob(scheduleConfig.getSchedule(), async () => {
    try {
      await etl.start(dataService);
    } catch (ex) {
      log.error('Unexpected error in service', ex);
    }
  });
} else {
  log.info('Running with no schedule. Execution will start immediately.');
  etl.start(dataService);
}
