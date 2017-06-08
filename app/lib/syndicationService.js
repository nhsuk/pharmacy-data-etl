const apiRequest = require('./etl-toolkit/apiRequest');
const xmlParser = require('./etl-toolkit/xmlParser');

const DEFAULT_URL = 'http://v1.syndication.nhschoices.nhs.uk/organisations/pharmacies';
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
  const url = `${DEFAULT_URL}/all.xml?apikey=${API_KEY}&page=${page}`;
  return apiRequest(url).then(xmlParser).then(rejectHtml);
}


module.exports = {
  DEFAULT_URL,
  SYNDICATION_HTML_PAGE_ERROR,
  getPharmacyAllPage,
};
