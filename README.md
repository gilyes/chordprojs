# angular-chordpro

A ChordPro parser and formatter for Angular.

## Usage

```javascript
angular.module('app', [
        'angular-chordpro'
    ])

angular.module('app')
    .controller('Controller', function ($scope, chordpro) {
		...
        var formattedText = chordpro.toText(rawChordpro);
        var html = chordpro.toHtml(rawChordpro);
```
        
## Current limitations

 - Directives, comments are not yet processed.
