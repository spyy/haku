const gulp = require('gulp');
const config = require('./config/conf.json');
const sukunimet = require('./config/sukunimitilasto-2022-02-07-dvv.json');
const miehet = require('./config/etunimitilasto-2022-02-07-dvv.miehet.json');

const querystring = require('querystring');
const process = require('process');
const https = require('https');



function findArgument(arg) {
  let index = process.argv.findIndex(element => element == arg);
  
  if (index > 0) {
    index++;
  }
  
  return process.argv[index] ? process.argv[index] : ''; 
}


const letter = findArgument('--letter');
const location = findArgument('--location');


const filterLetter = (item, l, min) => {
  let re = new RegExp('^' + l, 'i');
  const count = Number.parseInt(item.count);

  if (count < min) {      
    return false;
  } else {
    return item.name.match(re) ? true : false;
  }
}

const filterMinimum = (item, min) => {
  const count = Number.parseInt(item.count);

  return count < min ? false : true;
}


const filteredLastNames = sukunimet.filter(item => filterMinimum(item, config.minCount));
const filteredFirstNames = miehet.filter(item => filterMinimum(item, config.minCount));
let letteredLastNames = [];

if (letter) {
  letteredLastNames = filteredLastNames.filter(item => filterLetter(item));
}

let lastNames = letteredLastNames.map(element => element.name);
let firstNames = filteredFirstNames.map(element => element.name);
let names = [];

lastNames.sort().forEach(lastName => {
  firstNames.sort().forEach(firstName => {
    names.push(lastName + ' ' + firstName);
  });
});


function generateQuery() {
  const what = 'what=' + lastNames[lastNameIndex] + '%20' + firstNames[firstNameIndex];
  let uri = config.address.replace('what', what);

  return uri;
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

  //console.log(address);

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

function doTask(cb) {
  console.log(generateQuery());

  lastNameIndex++;

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
  console.log(lastNames);

  console.log(lastNames.length);

  cb();
}

function showLastnames(cb) {
  console.log(JSON.stringify(filteredLastNames));

  cb();
}

function showNames(cb) {
  console.log('Miesten nimet: ' + lastNames.length);

  console.log(lastNames);

  cb();
}

function showMensNames(cb) {
  console.log(JSON.stringify(filteredFirstNames));

  cb();
}

function init(cb) {
  if (letter && location) {
    cb();
  } else {
    cb(new Error('parameter missing'));
  }
}


//exports.kirjain = gulp.series(init, lastNames, result);

exports.sukunimet = gulp.series(showLastnames);

exports.miehet = gulp.series(showMensNames);

exports.default = gulp.series(init, result);
