const service = require('../syndicationService');
const mapTotalPages = require('../mappers/mapTotalPages');


function getTotalPages() {
  return service.getPharmacyAllPage(1).then(mapTotalPages);
}

module.exports = getTotalPages;
