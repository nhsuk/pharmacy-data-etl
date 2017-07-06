function getAttribute(member, field) {
  return member && member.$ && member.$[field];
}

function getNested(obj, key) {
  // eslint-disable-next-line arrow-body-style
  return key.split('.').reduce((o, x) => {
    return (typeof o === 'undefined' || o === null) ? o : o[x];
  }, obj);
}

module.exports = {
  getAttribute,
  getNested,
};
