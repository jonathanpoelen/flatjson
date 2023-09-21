#!/usr/bin/env python3
from sys import stdout, argv, stderr
from json import load as json_load, JSONDecodeError
import re
import sys

# for big json
sys.setrecursionlimit(2000)

def quoted(s: str) -> str:
  return s

quotedKey = quoted


def print_json(data, prefix: str = '') -> None:
  t = type(data)
  if t == dict:
    for k, v in data.items():
      print_json(v, f'{prefix}.{quotedKey(k)}')
  elif t == list:
    for i, v in enumerate(data):
      print_json(v, f'{prefix}[{i}]')
  elif t == str:
    stdout.write(f'{prefix} = {quoted(data)}\n')
  else:
    stdout.write(f'{prefix} = {data}\n')


def makeQuoted(c: str):
  replacements = {
    c: '\\'+c,
    '\\': '\\\\',
    '\a': '\\a',
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\v': '\\v',
    '\f': '\\f',
    '\r': '\\r',
  }
  patt = re.compile(fr"[{c}\\\x07-\x0D]");
  pattCheck = re.compile(r"^\w*$")
  return (lambda s: f'{c}{patt.sub(lambda m: replacements[m[0]], s)}{c}',
          lambda s: s if pattCheck.match(s) else quoted(s))


ifile = 1

if len(argv) > 1:
  arg = argv[1]

  if arg == '-h' or arg == '--help':
    print('''Usage: flatjson [-q | -Q] [FILE]...
 -q          string are in single quote
 -Q          string are in double quote
 -h, --help  this help''')
    exit(0)

  elif arg == '-q':
    quoted, quotedKey = makeQuoted("'")
    ifile += 1;

  elif arg == '-Q':
    quoted, quotedKey = makeQuoted('"')
    ifile += 1

  elif arg == '--':
    ifile += 1


errcode = 0

if len(argv) <= ifile:
  ifile -= 1
  argv[ifile] = '/dev/stdin'

for i in range(ifile, len(argv)):
  try:
    with open(argv[i], 'rb') as f:
      try:
        json = json_load(f)
      except JSONDecodeError:
        errcode = errcode or 2
        continue

      try:
        print_json(json)
      except OSError as e:
        exit(errcode)

  except OSError:
    errcode = errcode or 1
exit(errcode)
