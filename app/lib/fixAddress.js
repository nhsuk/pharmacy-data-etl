const fields = ['line1', 'line2', 'line3', 'city', 'county'];

function getFieldName(fieldIndex) {
  return fields[fieldIndex];
}

function toLowerCaseNoWhiteSpace(str) {
  return str && str.toLowerCase().replace(/\s/g, '');
}

function areSame(a, b) {
  return toLowerCaseNoWhiteSpace(a) === toLowerCaseNoWhiteSpace(b);
}

function blankDuplicateFieldNames(address, fieldIndex) {
  for (let i = fieldIndex + 1; i <= fields.length - 1; i++) {
    if (areSame(address[getFieldName(fieldIndex)], address[getFieldName(i)])) {
      // eslint-disable-next-line no-param-reassign
      address[getFieldName(i)] = '';
    }
  }
}

function fixAddress(address) {
  if (address) {
    for (let i = 0; i <= fields.length - 1; i++) {
      blankDuplicateFieldNames(address, i);
    }
  }
}

module.exports = fixAddress;
