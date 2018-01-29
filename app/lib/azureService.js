const azure = require('azure-storage');

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

module.exports = {
  uploadToAzure,
  downloadFromAzure,
  deleteFromAzure,
  listBlobs,
};
