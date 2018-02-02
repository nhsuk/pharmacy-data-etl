const utils = require('../utils');

function fromSummary(pharmSummary) {
  return utils.getNested(pharmSummary, 'content.organisationSummary.odscode') ||
         utils.getNested(pharmSummary, 'content.organisationSummary.odsCode');
}

function fromResults(results) {
  return results.feed && results.feed.entry ?
    utils.asArray(results.feed.entry).map(fromSummary).filter(o => o !== undefined) : [];
}

module.exports = {
  fromResults,
  fromSummary,
};
