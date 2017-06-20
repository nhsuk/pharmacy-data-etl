const utils = require('../utils');

function fromSummary(pharmSummary) {
  return utils.getNested(pharmSummary, 'content.organisationSummary.odscode');
}

function fromResults(results) {
  return results.feed && results.feed.entry &&
         results.feed.entry.constructor === Array ?
         results.feed.entry.map(fromSummary) : [];
}

module.exports = {
  fromResults,
  fromSummary,
};
