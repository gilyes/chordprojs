# angular-chordpro

A ChordPro parser and formatter for Angular.

## Usage

```javascript
angular.module('app')
    .controller('Controller', function ($scope, chordpro) {
		...
        var formattedChordpro = chordpro.toText(rawChordpro);
```
        
## Current limitations

 - Only simple formatting to text is supported.
 - Directives, comments are not yet processed.
