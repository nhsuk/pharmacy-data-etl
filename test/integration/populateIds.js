const chai = require('chai');

const populateIds = require('../../app/lib/etl-toolkit/queues/populateIds');
const etlStore = require('../../app/lib/etl-toolkit/etlStore');

const expect = chai.expect;

function getIdsAction(pageNo) {
  return new Promise((resolve) => {
    resolve([pageNo + 10, pageNo + 20]);
  });
}
function getIdsWithErrorAction(pageNo) {
  return new Promise((resolve) => {
    if (pageNo === 2) {
      throw new Error('bad page');
    } else {
      resolve([pageNo + 10, pageNo + 20]);
    }
  });
}

function assertEtlStore() {
  const ids = etlStore.getIds();
  expect(ids.length).to.equal(4);
  expect(ids[0]).to.equal(11);
  expect(ids[1]).to.equal(21);
  expect(ids[2]).to.equal(12);
  expect(ids[3]).to.equal(22);
}

describe('Populate ID queue', () => {
  beforeEach(() => {
    etlStore.clearState();
    populateIds.clearState();
  });

  it('should populate etlStore with loaded ids', (done) => {
    const options = {
      getIdsAction,
      queueComplete: () => {
        assertEtlStore();
        done();
      },
      totalPages: 2,
      workers: 1,
    };
    populateIds.start(options);
  });

  it('should call queueComplete for zero pages', (done) => {
    const options = {
      getIdsAction: () => { done('should not have been called'); },
      queueComplete: () => {
        done();
      },
      totalPages: 0,
      workers: 1,
    };
    populateIds.start(options);
  });

  it('should ignore pages already scanned', (done) => {
    const queueComplete = () => {
      assertEtlStore();
      done();
    };

    const options = {
      getIdsAction: () => { done('should not have been called'); },
      queueComplete,
      totalPages: 2,
      workers: 1,
    };

    const restartQueue = () => {
      populateIds.start(options);
    };

    const restartOptions = {
      getIdsAction,
      queueComplete: restartQueue,
      totalPages: 2,
      workers: 1,
    };

    populateIds.start(restartOptions);
  });

  it('should gracefully handle errors', (done) => {
    const options = {
      getIdsAction: getIdsWithErrorAction,
      queueComplete: () => {
        const ids = etlStore.getIds();
        expect(ids.length).to.equal(4);
        done();
      },
      totalPages: 3,
      workers: 1,
    };
    populateIds.start(options);
  });
});
