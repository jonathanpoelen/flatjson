#!/usr/bin/env node
const fs = require('fs');

const singleQuote = function(s) {
  return `'${s.replace("\\", "\\\\").replace("'", "\\'")}'`;
}

const doubleQuote = function(s) {
  return `"${s.replace("\\", "\\\\").replace('"', '\\"')}"`;
}

const identity = function(s) {
  return s;
}

const printJSON = function(data, prefix, quoted)
{
  switch (data.constructor.name)
  {
    case 'Array':
      for (const i in data)
        printJSON(data[i], `${prefix}[${i}]`, quoted);
      break;
    case 'Object':
      for (const k in data)
        printJSON(data[k], `${prefix}.${quoted(k)}`, quoted);
      break;
    case 'String':
      console.log(`${prefix} = ${quoted(data)}`);
      break;
    default:
      console.log(`${prefix} = ${data}`);
  }
}

let ifile = 2;
let quoted = identity;

switch (process.argv[2]) {
  case '-h':
  case '--help':
    console.error(`Usage: flatjson [-q | -Q] [FILE]...
 -q          string are in single quote
 -Q          string are in double quote
 -h, --help  this help`);
    break;
  case '-q':
    quoted = singleQuote;
    ++ifile;
    break;
  case '-Q':
    quoted = doubleQuote;
    ++ifile;
    break;
}

let filename = process.argv[ifile] || '/dev/stdin';
let errcode = 0;

const processFile = function(err, data) {
  if (err) {
    console.error(err.toString());
    errcode = errcode || 2;
  }
  else {
    try {
      printJSON(JSON.parse(data), '', quoted);
    }
    catch (e) {
      console.error(`Parse error: ${filename}: ${e.message}`)
      errcode = errcode || 3;
    }
  }

  ++ifile;
  if (ifile < process.argv.length) {
    filename = process.argv[ifile];
    fs.readFile(filename, 'utf8' , processFile);
  }
  else {
    process.exit(errcode);
  }
}

fs.readFile(filename, 'utf8', processFile);
