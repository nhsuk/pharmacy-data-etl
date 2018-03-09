const getDateFromFilename = require('./getDateFromFilename');

const regex = /.*-(\d{8}).*/;

function sortByFilenameDateDesc(first, second) {
  const a = getDateFromFilename(first.name, regex);
  const b = getDateFromFilename(second.name, regex);
  if (a.isBefore(b)) {
    return 1;
  }
  if (b.isBefore(a)) {
    return -1;
  }
  return 0;
}

module.exports = sortByFilenameDateDesc;
