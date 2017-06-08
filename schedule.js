const schedule = require('node-schedule');

const etl = require('./etl');
const log = require('./app/lib/logger');

const rule = process.env.ETL_SCHEDULE || '0 23 * * *';

log.info(`Scheduling job with rule '${rule}'`);
schedule.scheduleJob(rule, () => {
  etl.start();
});
