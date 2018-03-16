const chai = require('chai');

const fixAddress = require('../../app/lib/fixAddress');

const expect = chai.expect;

describe('Fix Address', () => {
  it('should gracefully handle undefined address', () => {
    const address = undefined;
    try {
      fixAddress(address);
    } catch (ex) {
      chai.assert.fail('should not have thrown exception');
    }
  });

  it('should blank duplicate line 1-2', () => {
    const address = {
      city: 'Walsall',
      county: 'West Midlands',
      line1: '9 High Street',
      line2: '9 High Street',
      line3: 'Walsall Wood',
      postcode: 'WS9 9LR',
    };

    fixAddress(address);
    expect(address.line1).to.equal('9 High Street');
    expect(address.line2).to.equal('');
  });

  it('should blank duplicate line 2-3', () => {
    const address = {
      city: 'Walsall',
      county: 'West Midlands',
      line1: '9 High Street',
      line2: 'Walsall Wood',
      line3: 'Walsall Wood',
      postcode: 'WS9 9LR',
    };

    fixAddress(address);
    expect(address.line2).to.equal('Walsall Wood');
    expect(address.line3).to.equal('');
  });

  it('should blank duplicate line 3-city', () => {
    const address = {
      city: 'Walsall',
      county: 'West Midlands',
      line1: '9 High Street',
      line2: 'Walsall Wood',
      line3: 'Walsall',
      postcode: 'WS9 9LR',
    };

    fixAddress(address);
    expect(address.line3).to.equal('Walsall');
    expect(address.city).to.equal('');
  });

  it('should blank duplicate line city-county', () => {
    const address = {
      city: 'West Midlands',
      county: 'West Midlands',
      line1: '9 High Street',
      line2: 'Walsall Wood',
      line3: 'Walsall',
      postcode: 'WS9 9LR',
    };

    fixAddress(address);
    expect(address.city).to.equal('West Midlands');
    expect(address.county).to.equal('');
  });

  it('should blank duplicate line, ignoring case', () => {
    const address = {
      city: 'WALSALL',
      county: 'West Midlands',
      line1: '9 High Street',
      line2: 'Walsall Wood',
      line3: 'Walsall',
      postcode: 'WS9 9LR',
    };

    fixAddress(address);
    expect(address.line3).to.equal('Walsall');
    expect(address.city).to.equal('');
  });

  it('should blank duplicate line, ignoring whitespace', () => {
    const address = {
      city: '',
      county: 'West Midlands',
      line1: '9 High Street',
      line2: 'Walsall Wood',
      line3: 'WalsallWOOD',
      postcode: 'WS9 9LR',
    };

    fixAddress(address);
    expect(address.line2).to.equal('Walsall Wood');
    expect(address.line3).to.equal('');
  });
});
