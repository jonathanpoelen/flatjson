#!/usr/bin/env bash

DIFF=${DIFF:-diff}
json='{"key1": "value1",
"key2": [1,5],
"key3": {"a": "x\"'\''\"'\''", "b-c": 4}
}'

typeset -i errcode=0
test() {
  echo -n "$1..."
  "$DIFF" <(echo "$2") <(./flatjson.js $3 <<<"$json" 2>&1) \
    && echo ' Ok' \
    || { ((errcode++)); echo ' Failed'; }
}

test default \
".key1 = value1
.key2[0] = 1
.key2[1] = 5
.key3.a = x\"'\"'
.key3.b-c = 4"

test 'single quote' \
".key1 = 'value1'
.key2[0] = 1
.key2[1] = 5
.key3.a = 'x\"\\'\"\\''
.key3.'b-c' = 4" -q

test 'double quote' \
".key1 = \"value1\"
.key2[0] = 1
.key2[1] = 5
.key3.a = \"x\\\"'\\\"'\"
.key3.\"b-c\" = 4" -Q

exit $errcode
