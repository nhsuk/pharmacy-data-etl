function limiter(reqsPerHour, action, callback) {
  const rateMs = 1000 / (reqsPerHour / 3600);
  const timeBefore = new Date();
  action().then((res) => {
    const elapsed = new Date() - timeBefore;
    // if maxed out give a grace period of 10 ms
    const waitTime = elapsed < rateMs ? rateMs - elapsed : 10;
    this.timeout = setTimeout(() => { callback(res); }, waitTime);
  });
}

module.exports = limiter;
