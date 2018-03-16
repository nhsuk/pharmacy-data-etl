const chai = require('chai');

const populateRecordsFromIds = require('../../app/lib/etl-toolkit/queues/populateRecordsFromIds');
const etlStore = require('../../app/lib/etl-toolkit/etlStore');

const expect = chai.expect;

const odsCode1 = 'FP1';
const odsCode2 = 'FP2';
const odsCode3 = 'FP3';

function getPharmacyAction(odsCode) {
  return new Promise((resolve) => {
    resolve({ identifier: odsCode });
  });
}

function getPharmacyWithErrorAction(odsCode) {
  return new Promise((resolve) => {
    if (odsCode === odsCode2) {
      throw new Error('error in json');
    } else {
      resolve({ identifier: odsCode });
    }
  });
}

describe('Populate ID queue', () => {
  beforeEach(() => {
    etlStore.clearState();
  });

  it('should populate etlStore with pharmacy records', (done) => {
    etlStore.addIds([odsCode1, odsCode2, odsCode3]);
    const options = {
      populateRecordAction: getPharmacyAction,
      queueComplete: () => {
        /* eslint-disable no-underscore-dangle */
        expect(etlStore.getRecord(odsCode1).identifier).to.equal(odsCode1);
        expect(etlStore.getRecord(odsCode2).identifier).to.equal(odsCode2);
        expect(etlStore.getRecord(odsCode3).identifier).to.equal(odsCode3);
        expect(etlStore.getErorredIds().length).to.equal(0);
        expect(etlStore.getRecords().length).to.equal(3);
        /* eslint-enable no-underscore-dangle */
        done();
      },
      workers: 1,
    };
    populateRecordsFromIds.start(options);
  });

  it('should call queueComplete for empty ID list', (done) => {
    etlStore.addIds([]);
    const options = {
      populateRecordAction: getPharmacyAction,
      queueComplete: () => {
        done();
      },
      workers: 1,
    };
    populateRecordsFromIds.start(options);
  });

  it('should skip duplicate IDs', (done) => {
    etlStore.addIds([odsCode1, odsCode2, odsCode3, odsCode1]);
    const options = {
      populateRecordAction: getPharmacyAction,
      queueComplete: () => {
        /* eslint-disable no-underscore-dangle */
        expect(etlStore.getRecord(odsCode1).identifier).to.equal(odsCode1);
        expect(etlStore.getRecord(odsCode2).identifier).to.equal(odsCode2);
        expect(etlStore.getRecord(odsCode3).identifier).to.equal(odsCode3);
        expect(etlStore.getErorredIds().length).to.equal(0);
        expect(etlStore.getRecords().length).to.equal(3);
        /* eslint-enable no-underscore-dangle */
        done();
      },
      workers: 1,
    };
    populateRecordsFromIds.start(options);
  });

  it('should add failed IDs to list', (done) => {
    etlStore.addIds([odsCode1, odsCode2, odsCode3]);
    const options = {
      populateRecordAction: getPharmacyWithErrorAction,
      queueComplete: () => {
        /* eslint-disable no-underscore-dangle */
        expect(etlStore.getRecord(odsCode1).identifier).to.equal(odsCode1);
        expect(etlStore.getRecord(odsCode3).identifier).to.equal(odsCode3);
        expect(etlStore.getRecords().length).to.equal(2);
        expect(etlStore.getErorredIds().length).to.equal(1);
        /* eslint-enable no-underscore-dangle */
        done();
      },
      workers: 1,
    };
    populateRecordsFromIds.start(options);
  });

  it('starting retry queue should retry failed IDs and remove from the list if successful', (done) => {
    etlStore.addIds([odsCode1, odsCode2, odsCode3]);

    const retryOptions = {
      populateRecordAction: getPharmacyAction,
      queueComplete: () => {
        /* eslint-disable no-underscore-dangle */
        expect(etlStore.getRecord(odsCode1).identifier).to.equal(odsCode1);
        expect(etlStore.getRecord(odsCode3).identifier).to.equal(odsCode3);
        expect(etlStore.getRecords().length).to.equal(3);
        expect(etlStore.getErorredIds().length).to.equal(0);
        /* eslint-enable no-underscore-dangle */
        done();
      },
      workers: 1,
    };

    const options = {
      populateRecordAction: getPharmacyWithErrorAction,
      queueComplete: () => {
        expect(etlStore.getRecords().length).to.equal(2);
        expect(etlStore.getErorredIds().length).to.equal(1);
        populateRecordsFromIds.startRetryQueue(retryOptions);
      },
      workers: 1,
    };
    populateRecordsFromIds.start(options);
  });
});
