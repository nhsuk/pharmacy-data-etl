function getAttribute(member, field) {
  return member && member.$ && member.$[field];
}

function getNested(obj, key) {
  // eslint-disable-next-line arrow-body-style
  return key.split('.').reduce((o, x) => {
    return (typeof o === 'undefined' || o === null) ? o : o[x];
  }, obj);
}

function getFilePrefix() {
  // prevent dev and test from over-writing production azure blob
  return process.env.NODE_ENV === 'production' ? '' : `${process.env.UPLOAD_PREFIX || 'dev'}-`;
}

function asArray(obj) {
  return obj.constructor === Array ? obj : [obj];
}

module.exports = {
  getAttribute,
  getNested,
  getFilePrefix,
  asArray
};
