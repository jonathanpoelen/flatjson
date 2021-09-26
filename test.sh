#!/usr/bin/env bash

DIFF=${DIFF:-diff}
json='{"key1": "value1",
"key2": [1,5],
"key3": {"a": "x\"'\''", "b": 4}
}'

typeset -i errcode=0
test() {
  echo -n "$1..."
  "$DIFF" <(echo -e "$2") <(./flatjson.js $3 <<<"$json" 2>&1) \
    && echo ' Ok' \
    || { ((errcode++)); echo ' Failed'; }
}

test default ".key1 = value1\n.key2[0] = 1\n.key2[1] = 5\n.key3.a = x\"'\n.key3.b = 4"

test 'single quote' ".'key1' = 'value1'\n.'key2'[0] = 1\n.'key2'[1] = 5\n.'key3'.'a' = 'x\"\\''\n.'key3'.'b' = 4" -q

test 'double quote' ".\"key1\" = \"value1\"\n.\"key2\"[0] = 1\n.\"key2\"[1] = 5\n.\"key3\".\"a\" = \"x\\\"'\"\n.\"key3\".\"b\" = 4" -Q

exit $errcode
