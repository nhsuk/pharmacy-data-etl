const chai = require('chai');

const fixAddress = require('../../app/lib/fixAddress');

const expect = chai.expect;

describe('Fix Address', () => {
  it('should gracefully handle undefined address', () => {
    const address = undefined;
    fixAddress(address);
  });

  it('should blank duplicate line 1-2', () => {
    const address = {
      line1: '9 High Street',
      line2: '9 High Street',
      line3: 'Walsall Wood',
      city: 'Walsall',
      county: 'West Midlands',
      postcode: 'WS9 9LR'
    };

    fixAddress(address);
    expect(address.line1).to.equal('9 High Street');
    expect(address.line2).to.equal('');
  });

  it('should blank duplicate line 2-3', () => {
    const address = {
      line1: '9 High Street',
      line2: 'Walsall Wood',
      line3: 'Walsall Wood',
      city: 'Walsall',
      county: 'West Midlands',
      postcode: 'WS9 9LR'
    };

    fixAddress(address);
    expect(address.line2).to.equal('Walsall Wood');
    expect(address.line3).to.equal('');
  });

  it('should blank duplicate line 3-city', () => {
    const address = {
      line1: '9 High Street',
      line2: 'Walsall Wood',
      line3: 'Walsall',
      city: 'Walsall',
      county: 'West Midlands',
      postcode: 'WS9 9LR'
    };

    fixAddress(address);
    expect(address.line3).to.equal('Walsall');
    expect(address.city).to.equal('');
  });

  it('should blank duplicate line city-county', () => {
    const address = {
      line1: '9 High Street',
      line2: 'Walsall Wood',
      line3: 'Walsall',
      city: 'West Midlands',
      county: 'West Midlands',
      postcode: 'WS9 9LR'
    };

    fixAddress(address);
    expect(address.city).to.equal('West Midlands');
    expect(address.county).to.equal('');
  });

  it('should blank duplicate line, ignoring case', () => {
    const address = {
      line1: '9 High Street',
      line2: 'Walsall Wood',
      line3: 'Walsall',
      city: 'WALSALL',
      county: 'West Midlands',
      postcode: 'WS9 9LR'
    };

    fixAddress(address);
    expect(address.line3).to.equal('Walsall');
    expect(address.city).to.equal('');
  });

  it('should blank duplicate line, ignoring whitespace', () => {
    const address = {
      line1: '9 High Street',
      line2: 'Walsall Wood',
      line3: 'WalsallWOOD',
      city: '',
      county: 'West Midlands',
      postcode: 'WS9 9LR'
    };

    fixAddress(address);
    expect(address.line2).to.equal('Walsall Wood');
    expect(address.line3).to.equal('');
  });
});
