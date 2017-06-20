const azure = require('azure-storage');

const config = require('./config.js');

const blobSvc = azure.createBlobService();

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
    blobSvc.createBlockBlobFromLocalFile(config.containerName, name, filePath, (error, result) => {
      if (!error) {
        resolve(result);
      }
      reject(error);
    });
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
  deleteFromAzure,
  listBlobs,
};
