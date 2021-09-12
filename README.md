Flatten keys and values of a JSON file in a greppable format.

# Usage

```
Usage: flatjson [-q | -Q] [FILE]...
 -q  string are in single quote
 -Q  string are in double quote
```

# Example

```sh
flatjson.js <<<'{"key1": "value1",
"key2": [1,5,7],
"key3": {"a": "x", "b": 4}
}'
```

output:
```
.key1 = value1
.key2[0] = 1
.key2[1] = 5
.key2[2] = 7
.key3.a = x
.key3.b = 4
```
