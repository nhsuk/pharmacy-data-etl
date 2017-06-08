const bunyan = require('bunyan');

const log = bunyan.createLogger({ name: 'pomi-etl' });

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
