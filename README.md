[![Build Status](https://travis-ci.org/gilyes/chordprojs.svg?branch=master)](https://travis-ci.org/gilyes/chordprojs)

### chordprojs - a Chordpro parser and formatter

#### Usage

```javascript
var parseResult = chordpro.parse(source);
var formatResult = chordpro.formatParseResult(parseResult);
```
or
```javascript
var formatResult = chordpro.format(source)
```

`format` generates HTML where, when needed, chords are wrapping together with their associated lyrics line. Default CSS that works with the generated HTML is defined in `chordpro.css`.
