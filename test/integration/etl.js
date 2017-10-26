const nock = require('nock');
const fs = require('fs');

const etl = require('../../app/lib/etl');
const config = require('../../app/lib/config');

function readFile(path) {
  return fs.readFileSync(path, 'utf8');
}

const uri = `/all.xml?apikey=${process.env.SYNDICATION_API_KEY}&page=1`;

function stubResults(filePath) {
  const stubbedData = readFile(filePath);
  nock(config.syndicationApiUrl)
    .get(uri)
    .reply(200, stubbedData);
}

function stubNoResults() {
  stubResults('test/resources/zero-pages.xml');
}

function stubOnePageOfResults() {
  stubResults('test/resources/one-page.xml');
}

describe('ETL', function test() {
  this.timeout(5000);
  it('should complete ETL if no results', async () => {
    stubNoResults();
    await etl.start();
  });

  it('should complete ETL if one page of results', async () => {
    stubOnePageOfResults();
    await etl.start();
  });

  afterEach(() => {
    nock.cleanAll();
  });
});
