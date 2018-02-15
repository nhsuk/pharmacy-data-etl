const config = require('./config');

function getAttribute(member, field) {
  return member && member.$ && member.$[field];
}

function getMajorMinorVersion() {
  const parts = config.version.split('.');
  return `${parts[0]}.${parts[1]}`;
}
function getNested(obj, key) {
  // eslint-disable-next-line arrow-body-style
  return key.split('.').reduce((o, x) => {
    return (typeof o === 'undefined' || o === null) ? o : o[x];
  }, obj);
}

function getFilePrefix() {
  // prevent dev and test from over-writing production azure blob
  return process.env.NODE_ENV === 'production' ? '' : 'dev-';
}

function asArray(obj) {
  return obj.constructor === Array ? obj : [obj];
}

function getDuplicates(arr) {
  return arr.filter((value, index, self) => self.indexOf(value) !== index);
}

module.exports = {
  asArray,
  getAttribute,
  getDuplicates,
  getFilePrefix,
  getMajorMinorVersion,
  getNested,
};
