const { series } = require('gulp');
const config = require('./config/conf.json');
const columns = require('./config/columns.json');

const querystring = require('querystring');
const process = require('process');
const https = require('https');
const http = require('http');


let searchAddress = '';
let searchArray = [];
let searchIndex = 0;
let findings = [];
let failures = [];


function generateQuery() {
  const text = searchArray[searchIndex] + '* ' + searchAddress;

  const qstring = querystring.stringify({
    text: text,
    _: Date.now()
  });

  return qstring.replace(/%20/g, '+');
}

function parseJson(chunk) {
  try {
    const obj = JSON.parse(chunk);
    
    return obj;
  } catch (e) {
    failures.push(searchArray[searchIndex]);
  }

  return null;
}

function parseResponse(chunk) {
  const obj = parseJson(chunk);

  if (obj && Array.isArray(obj.results) && obj.results.length) {
    const result = obj.results[0];

    if (result.totalResultCount) {
      console.log(result.totalResultCount);
      findings.push(searchArray[searchIndex]);
    }
  }
}

function find() {
  const address = config.address + generateQuery();

  return new Promise((resolve, reject) => {
    const req = https.request(address, function(res) {      
      res.setEncoding('utf8');

      if (res.statusCode == 200) {  
        console.log(address);        
      } else {
        console.log(searchArray);
        reject('statuCode: ' + res.statusCode);
      }

      res.on('data', chunk => parseResponse(chunk));
      res.on('end', () => {
        searchIndex++;
        resolve();
      });
    });
  
    req.on('error', function(err) {
      reject(err);
    });
  
    req.end();
  });
}

function find2(cb) {
  const address = config.address + generateQuery();

  console.log(address);

  searchIndex++;

  cb();
}

function getRandomInt() {
  const res = Math.floor(Math.random() * config.maxRandom);

  return res < config.minRandom ? config.minRandom : res;
}

function wait() { 
  const delay = getRandomInt() * 1000;

  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), delay);
  });
}

function result(cb) {
  console.log('findings: ' + findings);
  console.log('failures: ' + failures);

  cb();
}

function showYleiset(cb) {
  console.log(columns);
  
  cb();
}

function findArgument(arg) {
  let index = process.argv.findIndex(element => element == arg);
  
  if (index > 0) {
    index++;
  }
  
  return process.argv[index] ? process.argv[index] : ''; 
}

function initColumn(cb, col) {
  searchAddress = findArgument('--address');

  if (searchAddress) {
    findings = [];
    failures = [];
    searchArray = columns[col],
    searchIndex = 0;

    cb();
  } else {
    cb(new Error('address not found'));
  }
}

function initColumn1(cb) {
  initColumn(cb, '1');
}

function initColumn2(cb) {
  initColumn(cb, '2');
}

function initColumn3(cb) {
  initColumn(cb, '3');
}

function initColumn4(cb) {
  initColumn(cb, '4');
}

function initColumn5(cb) {
  initColumn(cb, '5');
}

function initColumn6(cb) {
  initColumn(cb, '6');
}



exports.yleiset1 = series(initColumn1, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, result);
exports.yleiset2 = series(initColumn2, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, result);
exports.yleiset3 = series(initColumn3, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, result);
exports.yleiset4 = series(initColumn4, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, result);
exports.yleiset5 = series(initColumn5, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, result);
exports.yleiset6 = series(initColumn6, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, wait, find, result);
exports.yleiset9 = series(initColumn1, find, result);
exports.yleiset = series(showYleiset);
exports.default = series(result);
