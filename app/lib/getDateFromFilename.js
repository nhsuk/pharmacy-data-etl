const moment = require('moment');

const regex = /.*-(\d{8}).*/;
const minDate = moment(0);

function getMoment(dateString) {
  const date = moment(dateString, 'YYYYMMDD');
  return date.isValid() ? date : minDate;
}

function getDateFromFilename(name) {
  const match = name.match(regex);
  return match && match[1] ? getMoment(match[1]) : minDate;
}

module.exports = getDateFromFilename;
