const apiRequest = require('./etl-toolkit/apiRequest');
const xmlParser = require('./etl-toolkit/xmlParser');
const config = require('./config');

const API_KEY = process.env.SYNDICATION_API_KEY;
const SYNDICATION_HTML_PAGE_ERROR = 'Syndication XML page is returning HTML - server error';

function rejectHtml(json) {
  // in some cases if there is an error on a syndication page an HTML error page is returned
  // but with response type as 200 and a content-type of xml..
  // reject the page if the top tag is called html
  if (json.html) {
    throw new Error(SYNDICATION_HTML_PAGE_ERROR);
  }
  return json;
}

function getPharmacyAllPage(page) {
  const url = `${config.syndicationApiUrl}/all.xml?apikey=${API_KEY}&page=${page}`;
  return apiRequest(url).then(xmlParser).then(rejectHtml);
}

function datePath(moment) {
  return `${moment.year()}/${moment.month() + 1}/${moment.date()}`;
}

function getModifiedSincePage(moment, page) {
  const url = `${config.syndicationApiUrl}/modifiedsince/${datePath(moment)}.xml?apikey=${API_KEY}&page=${page}`;
  return apiRequest(url).then(xmlParser).then(rejectHtml);
}

module.exports = {
  SYNDICATION_HTML_PAGE_ERROR,
  getPharmacyAllPage,
  getModifiedSincePage,
};
