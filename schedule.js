const schedule = require('node-schedule');

const etl = require('./app/lib/etl');
const log = require('./app/lib/logger');
const scheduleConfig = require('./app/lib/scheduleConfig');

log.info(`Scheduling job with rule '${scheduleConfig.getSchedule()}'`);
schedule.scheduleJob(scheduleConfig.getSchedule(), () => {
  etl.start();
});
