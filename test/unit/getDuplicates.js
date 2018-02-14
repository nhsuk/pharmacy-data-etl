const chai = require('chai');

const getDuplicates = require('../../app/lib/utils').getDuplicates;

const expect = chai.expect;

describe('Get duplicates', () => {
  it('should return only the repeated elements in an array', () => {
    const ids = ['1', '2', '3', '3', '3', '1', '4'];
    const duplicates = getDuplicates(ids);
    expect(duplicates).to.exist;
    expect(duplicates.length).to.equal(3);
    expect(duplicates[0]).to.equal('3');
    expect(duplicates[1]).to.equal('3');
    expect(duplicates[2]).to.equal('1');
  });

  it('should return nothing for no duplicates', () => {
    const ids = ['1', '2', '3', '4'];
    const duplicates = getDuplicates(ids);
    expect(duplicates).to.exist;
    expect(duplicates.length).to.equal(0);
  });
});
