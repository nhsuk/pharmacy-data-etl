const chai = require('chai');

const mapTotalPages = require('../../app/lib/mappers/mapTotalPages');
const rawAll = require('../resources/all-page-1.json');
const modifiedOnlyOnePage = require('../resources/modified-only-one-page.json');

const expect = chai.expect;

describe('Map Total Pages', () => {
  it('should return the total page count', () => {
    const total = mapTotalPages(rawAll);
    expect(total).to.equal(385);
  });
  it('should return a count of one for a single page of modified results', () => {
    const total = mapTotalPages(modifiedOnlyOnePage);
    expect(total).to.equal(1);
  });
});
