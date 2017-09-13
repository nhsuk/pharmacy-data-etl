const defaultSchedule = '0 23 * * *';
const farFutureDate = new Date(2100, 0, 1, 0, 0);

function schedulerDisabled() {
  return process.env.DISABLE_SCHEDULER === 'true';
}

function getSchedule() {
  return schedulerDisabled() ? farFutureDate : process.env.ETL_SCHEDULE || defaultSchedule;
}

module.exports = {
  defaultSchedule,
  farFutureDate,
  getSchedule
};
