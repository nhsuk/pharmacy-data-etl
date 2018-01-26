const service = require('../syndicationService');
const mapOdsCode = require('../mappers/mapOdsCode');

function getOdsCodes(moment, pageNo) {
  return service.getModifiedSincePage(moment, pageNo)
    .then(mapOdsCode.fromResults);
}

module.exports = getOdsCodes;
