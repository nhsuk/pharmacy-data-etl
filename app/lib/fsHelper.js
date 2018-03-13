const fs = require('fs');

const log = require('./logger');

const outputDir = require('./config').outputDir;

function createDirIfMissing(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function saveJsonSync(obj, filename) {
  createDirIfMissing(outputDir);
  const json = JSON.stringify(obj);
  fs.writeFileSync(`${outputDir}/${filename}`, json, 'utf8');
  log.info(`${filename} saved`);
}

function loadJsonSync(filename) {
  const path = `${outputDir}/${filename}`;
  const jsonString = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : undefined;
  return jsonString ? JSON.parse(jsonString) : undefined;
}

module.exports = {
  loadJsonSync,
  saveJsonSync,
};
