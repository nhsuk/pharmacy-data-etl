const azure = require('azure-storage');
const moment = require('moment');
const config = require('./config.js');

const blobSvc = azure.createBlobService();

const AZURE_TIMEOUT_MINUTES = process.env.AZURE_TIMEOUT_MINUTES || 5;
const options = {
  clientRequestTimeoutInMs: AZURE_TIMEOUT_MINUTES * 60 * 1000,
};

function listBlobs() {
  return new Promise((resolve, reject) => {
    blobSvc.listBlobsSegmented(config.containerName, null, (error, result) => {
      if (!error) {
        resolve(result.entries);
      }
      reject(error);
    });
  });
}

function uploadToAzure(filePath, name) {
  return new Promise((resolve, reject) => {
    blobSvc.createBlockBlobFromLocalFile(
      config.containerName, name, filePath, options,
      (error, result) => {
        if (!error) {
          resolve(result);
        }
        reject(error);
      }
    );
  });
}

function downloadFromAzure(filePath, name) {
  return new Promise((resolve, reject) => {
    blobSvc.getBlobToLocalFile(
      config.containerName, name, filePath, options,
      (error, result) => {
        if (!error) {
          resolve(result);
        }
        reject(error);
      }
    );
  });
}

function deleteFromAzure(name) {
  return new Promise((resolve, reject) => {
    blobSvc.deleteBlob(config.containerName, name, (error, result) => {
      if (!error) {
        resolve(result);
      }
      reject(error);
    });
  });
}
function sortByDateDesc(first, second) {
  const a = moment(first.lastModified);
  const b = moment(second.lastModified);
  if (a.isBefore(b)) {
    return 1;
  }
  if (b.isBefore(a)) {
    return -1;
  }
  return 0;
}

async function getLatestBlob(filter) {
  return (await listBlobs())
    .filter(filter)
    .sort(sortByDateDesc)[0];
}

module.exports = {
  uploadToAzure,
  downloadFromAzure,
  deleteFromAzure,
  listBlobs,
  getLatestBlob
};
