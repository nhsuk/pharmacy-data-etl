const chai = require('chai');

const mapOdsCode = require('../../app/lib/mappers/mapOdsCode');
const rawAll = require('../resources/all-page-1.json');
const rawSingle = require('../resources/all-one-pharmacy.json');
const rawSingleNoId = require('../resources/all-one-pharmacy-no-odscode.json');

const expect = chai.expect;

describe('ODS code mapper', () => {
  it('should create list of ODS codes', () => {
    const odsCodes = mapOdsCode.fromResults(rawAll);
    // eslint-disable-next-line no-unused-expressions
    expect(odsCodes).to.exist;
    expect(odsCodes.length).to.equal(30);
  });

  it('should gracefully handle no feed property', () => {
    const odsCodes = mapOdsCode.fromResults({});
    // eslint-disable-next-line no-unused-expressions
    expect(odsCodes).to.exist;
    expect(odsCodes.length).to.equal(0);
  });

  it('should gracefully handle no entry property', () => {
    const odsCodes = mapOdsCode.fromResults({ feed: {} });
    // eslint-disable-next-line no-unused-expressions
    expect(odsCodes).to.exist;
    expect(odsCodes.length).to.equal(0);
  });

  it('should gracefully handle entry is not an array', () => {
    const odsCodes = mapOdsCode.fromResults({ feed: { entry: {} } });
    // eslint-disable-next-line no-unused-expressions
    expect(odsCodes).to.exist;
    expect(odsCodes.length).to.equal(0);
  });

  it('should read ODS code from single summary result', () => {
    const id = mapOdsCode.fromSummary(rawSingle);
    // eslint-disable-next-line no-unused-expressions
    expect(id).to.exist;
    expect(id).to.equal('FJA60');
  });

  it('should gracefully handle missing ODS code', () => {
    const id = mapOdsCode.fromSummary(rawSingleNoId);
    // eslint-disable-next-line no-unused-expressions
    expect(id).to.be.undefined;
  });

  it('should gracefully handle undefined summary', () => {
    const id = mapOdsCode.fromSummary(undefined);
    // eslint-disable-next-line no-unused-expressions
    expect(id).to.be.undefined;
  });
});
