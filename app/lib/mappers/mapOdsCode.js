const utils = require('../utils');
// const fs = require('fs');

function fromSummary(pharmSummary) {
  return utils.getNested(pharmSummary, 'content.organisationSummary.odscode');
}

function fromResults(results) {
  // fs.writeFileSync('test/resources/all-page1.json', JSON.stringify(results), 'utf8');
  return results.feed && results.feed.entry &&
         results.feed.entry.constructor === Array ?
         results.feed.entry.map(fromSummary) : [];
}

module.exports = {
  fromResults,
  fromSummary,
};
