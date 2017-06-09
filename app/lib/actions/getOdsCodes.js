const service = require('../syndicationService');
const mapOdsCode = require('../mappers/mapOdsCode');

function getOdsCodes(pageNo) {
  return service.getPharmacyAllPage(pageNo)
    .then(mapOdsCode.fromResults);
}

module.exports = getOdsCodes;
