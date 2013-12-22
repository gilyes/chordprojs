(function(window, document) {

// Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Grunt

// Config
angular.module('angular-chordpro.config', [])
    .value('angular-chordpro.config', {
        debug: true
    });

// Modules
angular.module('angular-chordpro.directives', []);
angular.module('angular-chordpro.filters', []);
angular.module('angular-chordpro.services',
    [
        'ngSanitize'
    ]);
angular.module('angular-chordpro',
    [
        'angular-chordpro.config',
        'angular-chordpro.directives',
        'angular-chordpro.filters',
        'angular-chordpro.services',
        'ngSanitize'
    ]);
angular.module('angular-chordpro.services')
    .factory('chordpro', ['$sanitize', function ($sanitize) {

        function parse(source) {
            var lineInfos = [];

            var chordRegex = /\[([a-zA-Z0-9#/]+)\]/g;
            var directiveRegex = /^{.*}/;
            var commentRegex = /^#/;

            source.split('\n').forEach(function (line) {

                var fragment;
                if (line.match(commentRegex)) {
                    // TODO: handle comments
                }
                else if (line.match(directiveRegex)) {
                    // TODO: handle directives
                }
                else if (line.match(chordRegex)) {
                    var lineInfo = {
                        type: 'lyrics',
                        lyrics: '',
                        chords: []
                    };

                    var sourcePos = 0;
                    var match;
                    while ((match = chordRegex.exec(line))) {

                        // append lyrics text ending at current match position
                        fragment = line.substring(sourcePos, match.index);
                        if (fragment) {
                            lineInfo.lyrics += fragment;
                        }

                        // determine offset to apply if previous chord is too long and would overlap with current chord
                        var offset = 0;
                        if (lineInfo.chords.length > 0) {
                            var previousChordInfo = lineInfo.chords[lineInfo.chords.length - 1];
                            offset = Math.max(0, previousChordInfo.pos + previousChordInfo.chord.length + 1 - lineInfo.lyrics.length);
                        }

                        // pad lyrics field if needed
                        for (var i = 0; i < offset; i++) {
                            lineInfo.lyrics += ' ';
                        }

                        // add chord
                        var sourceChord = match[0];
                        lineInfo.chords.push({
                            pos: lineInfo.lyrics.length,
                            chord: sourceChord.replace(/[\[\]]/g, '')
                        });
                        sourcePos = match.index + sourceChord.length;
                    }

                    // append lyrics text following last chord
                    fragment = line.substring(sourcePos, line.length);
                    if (fragment) {
                        lineInfo.lyrics += fragment;
                    }

                    // trim end of lyrics text
                    lineInfo.lyrics = lineInfo.lyrics.replace(/\s+$/, '');

                    lineInfos.push(lineInfo);
                }
                else {
                    lineInfos.push({
                        type: 'lyrics',
                        lyrics: line,
                        chords: []
                    });
                }
            });

            return lineInfos;
        }

        function formatLyricsEntry(entry, lineEnd, chordFormatter) {

            function addChord(line, chordInfo) {
                // pad the current line up to the chord position
                var strippedLine = line.replace(/(<([^>]+)>)/ig, '');
                var padding = chordInfo.pos - strippedLine.length;
                if (padding > 0) {
                    line += Array(padding + 1).join(' ');
                }

                var chord = chordInfo.chord;
                if (chordFormatter) {
                    chord = chordFormatter(chord);
                }

                line += chord;
                return line;
            }

            var text = '';

            // add chord line if available
            if (entry.chords.length > 0) {

                var line = '';
                entry.chords.forEach(function (chordInfo) {
                    line = addChord(line, chordInfo);
                });

                text += line;
            }

            // add lyrics line if available, or empty line if no chords and no lyrics
            if (entry.lyrics.length > 0 || entry.chords.length === 0) {
                if (text.length > 0) {
                    text += lineEnd;
                }

                text += entry.lyrics;
            }

            return text;
        }

        function format(source, newLine, chordFormatter) {
            var parsed = parse(source);

            var text = '';
            parsed.forEach(function (entry) {
                if (entry.type === 'lyrics') {
                    if (text.length > 0) {
                        text += newLine;
                    }
                    text += formatLyricsEntry(entry, newLine, chordFormatter);
                }
            });

            return text;
        }

        function toText(source) {
            return format(source, '\n');
        }

        function toHtml(source, options) {
            if (!options) {
                options = {};
            }

            if (!options.chordFormatter) {
                options.chordFormatter = function (chord) {
                    return '<b>' + chord + '</b>';
                };
            }

            var openingPre = '<pre>';
            if (options.class) {
                openingPre = '<pre class="'+ options.class + '">';
            }
            return $sanitize(openingPre + format(source, '<br/>', options.chordFormatter) + '</pre>');
        }

        return {
            parse: parse,
            toText: toText,
            toHtml: toHtml
        };
    }]);
})(window, document);