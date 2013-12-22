# angular-chordpro

A ChordPro parser and formatter for Angular.

## Usage

```javascript
angular.module('app')
    .controller('Controller', function ($scope, chordpro) {
		...
        var formattedChordpro = chordpro.toText(rawChordpro);