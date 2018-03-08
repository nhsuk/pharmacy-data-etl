const chai = require('chai');
const sortByFilenameDateDesc = require('../../app/lib/sortByFilenameDateDesc');

const expect = chai.expect;

describe('sort by filename date in descending order', () => {
  it('should sort by date string in name', () => {
    const files = [
      { name: 'data-20180220.json' },
      { name: 'data-20180320.json' },
      { name: 'data-20180120.json' },
    ];
    const result = files.sort(sortByFilenameDateDesc);
    expect(result[0].name).to.be.equal('data-20180320.json');
    expect(result[1].name).to.be.equal('data-20180220.json');
    expect(result[2].name).to.be.equal('data-20180120.json');
  });

  it('should put files with no dates last', () => {
    const files = [
      { name: 'data.json' },
      { name: 'data-20180320.json' },
      { name: 'data-20180120.json' },
    ];
    const result = files.sort(sortByFilenameDateDesc);
    expect(result[0].name).to.be.equal('data-20180320.json');
    expect(result[1].name).to.be.equal('data-20180120.json');
    expect(result[2].name).to.be.equal('data.json');
  });

  it('should put files with badly formatted dates last', () => {
    const files = [
      { name: 'data-20189999.json' },
      { name: 'data-20180320.json' },
      { name: 'data-20180120.json' },
    ];
    const result = files.sort(sortByFilenameDateDesc);
    expect(result[0].name).to.be.equal('data-20180320.json');
    expect(result[1].name).to.be.equal('data-20180120.json');
    expect(result[2].name).to.be.equal('data-20189999.json');
  });
});
