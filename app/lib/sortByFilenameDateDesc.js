const getDateFromFilename = require('./getDateFromFilename');

function sortByFilenameDateDesc(first, second) {
  const a = getDateFromFilename(first.name);
  const b = getDateFromFilename(second.name);
  if (a.isBefore(b)) {
    return 1;
  }
  if (b.isBefore(a)) {
    return -1;
  }
  return 0;
}

module.exports = sortByFilenameDateDesc;
