const utils = require('../utils');

const pageCountPattern = /.*page=(\d+)/i;

function getMatchedNumber(url, pattern) {
  const match = pattern.exec(url);
  if (match && match.length === 2) {
    return Number(match[1]);
  }
  return undefined;
}

function getPageCount(url) {
  return getMatchedNumber(url, pageCountPattern);
}

function matchLastPage(link) {
  return utils.getAttribute(link, 'rel') === 'last';
}

function onlyOneLink(links) {
  return links.constructor !== Array;
}

function getTotalPages(links) {
  if (onlyOneLink(links)) {
    return 1;
  }
  const lastPageLink = links.find(matchLastPage);
  if (lastPageLink) {
    return getPageCount(utils.getAttribute(lastPageLink, 'href'));
  }
  throw new Error('Could not get page count');
}
function mapTotalPages(results) {
  return getTotalPages(results.feed.link);
}

module.exports = mapTotalPages;
