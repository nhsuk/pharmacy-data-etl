const chai = require('chai');

const mapTotalPages = require('../../app/lib/mappers/mapTotalPages');
const rawAll = require('../resources/all-page-1.json');

const expect = chai.expect;

describe('Map Total Pages', () => {
  it('should return the total page count', () => {
    const total = mapTotalPages(rawAll);
    expect(total).to.equal(385);
  });
});
