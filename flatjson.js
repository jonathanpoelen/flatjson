#!/usr/bin/env node
const fs = require('fs');

let quoted = (s) => s;
let quotedKey = quoted;

function write(s)
{
  const len = fs.writeSync(1, s);
  if (len != s.length)
    throw 42;
}

const printJSON = function(data, prefix)
{
  switch (data.constructor.name)
  {
    case 'Array':
      for (const i in data)
        printJSON(data[i], `${prefix}[${i}]`);
      break;
    case 'Object':
      for (const k in data)
        printJSON(data[k], `${prefix}.${quotedKey(k)}`);
      break;
    case 'String':
      write(`${prefix} = ${quoted(data)}\n`);
      break;
    default:
      write(`${prefix} = ${data}\n`);
  }
}

const initQuoted = function(f)
{
  quoted = f;
  const pattern = /[\x00-\x2F\x3A-\x40\x5B-\x60\x7E\x7F]/;
  quotedKey = (s) => pattern.test(s) ? f(s) : s;
}

let ifile = 2;

switch (process.argv[2]) {
  case '-h':
  case '--help':
    console.error(`Usage: flatjson [-q | -Q] [FILE]...
 -q          string are in single quote
 -Q          string are in double quote
 -h, --help  this help`);
    break;

  case '-q': {
    const replacements = {
      '\'': '\\\'',
      '\\': '\\\\',
      '\a': '\\a',
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\v': '\\v',
      '\f': '\\f',
      '\r': '\\r',
    };
    const reg = /['\\\x07-\x0D]/g
    initQuoted((s) => `'${s.replace(reg, (c) => replacements[c])}'`);
    ++ifile;
    break;
  }

  case '-Q': {
    const replacements = {
      '\"': '\\\"',
      '\\': '\\\\',
      '\a': '\\a',
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\v': '\\v',
      '\f': '\\f',
      '\r': '\\r',
    };
    const reg = /["\\\x07-\x0D]/g
    initQuoted((s) => `"${s.replace(reg, (c) => replacements[c])}"`);
    ++ifile;
    break;
  }
}

let filename = process.argv[ifile] || '/dev/stdin';
let errcode = 0;

const processFile = function(err, data) {
  if (err) {
    console.error(err.toString());
    errcode = errcode || 2;
  }
  else {
    let json;
    try {
      json = JSON.parse(data);
    }
    catch (e) {
      console.error(`Parse error: ${filename}: ${e.message}`)
      errcode = errcode || 3;
    }

    try {
      printJSON(json, '');
    }
    catch (e) {
      process.exit(errcode || 4);
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
