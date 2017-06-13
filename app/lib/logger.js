const bunyan = require('bunyan');

const log = bunyan.createLogger({ name: 'pharmacy-data-etl' });

function info(message) {
  log.info(message);
}

function error(message, err) {
  log.error(message, err);
}

module.exports = {
  info,
  error,
};
