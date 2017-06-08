// the XML2Json parser cannot distinguish between a single tag and what is
// usually a list of tags but happens to only have one item this makes sure
/* function asArray(value) {
  if (value) {
    return value.constructor === Array ? value : [value];
  }
  return [];
}

function toBoolean(value) {
  return value && value.toLowerCase() === 'true';
}

function emptyObjectToUndefined(gpCounts) {
  return Object.keys(gpCounts).length > 0 ? gpCounts : undefined;
}
*/

function getAttribute(member, field) {
  return member && member.$ && member.$[field];
}

/*
function getBooleanAttribute(member, field) {
  return toBoolean(getAttribute(member, field));
}*/

function getNested(obj, key) {
   // eslint-disable-next-line arrow-body-style
  return key.split('.').reduce((o, x) => {
    return (typeof o === 'undefined' || o === null) ? o : o[x];
  }, obj);
}

module.exports = {
  /* asArray,
  emptyObjectToUndefined,
  toBoolean,
  getBooleanAttribute,*/
  getAttribute,
  getNested,
};
