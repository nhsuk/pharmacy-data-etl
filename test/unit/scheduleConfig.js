const chai = require('chai');
const config = require('../../app/lib/scheduleConfig');

const expect = chai.expect;

const disableScheduler = process.env.DISABLE_SCHEDULER;
const etlSchedule = process.env.ETL_SCHEDULE;

function resetEnv() {
  process.env.DISABLE_SCHEDULER = disableScheduler;
  process.env.ETL_SCHEDULE = etlSchedule;
}

describe('getSchedule', () => {
  it('should return a date far in the future when scheduler disabled', () => {
    process.env.DISABLE_SCHEDULER = 'true';
    expect(config.getSchedule()).to.be.a('Date');
    expect(config.getSchedule()).to.equal(config.farFutureDate);
    expect(config.getSchedule().getFullYear()).to.equal(2100);
  });

  it('should return default cron string when scheduler enabled and no ETL_SCHEDULE set', () => {
    process.env.DISABLE_SCHEDULER = 'false';
    delete process.env.ETL_SCHEDULE;
    expect(config.getSchedule()).to.equal(config.defaultSchedule);
  });

  it('should return the ETL_SCHEDULE cron string when scheduler enabled and ETL_SCHEDULE set', () => {
    const customSchedule = '0 7 * * *';
    process.env.DISABLE_SCHEDULER = 'false';
    process.env.ETL_SCHEDULE = customSchedule;
    expect(config.getSchedule()).to.equal(customSchedule);
  });

  afterEach(() => {
    resetEnv();
  });
});
