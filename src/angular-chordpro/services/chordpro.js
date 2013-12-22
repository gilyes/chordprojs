angular.module('angular-chordpro.services')
    .factory('chordpro', function () {

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

        function toText(source) {
            var parsed = parse(source);

            function addChord(line, chordInfo){
                while (line.length < chordInfo.pos) {
                    line += ' ';
                }
                line += chordInfo.chord;
                return line;
            }

            var text = '';
            parsed.forEach(function (entry) {
                if (entry.type === 'lyrics') {
                    if (entry.chords.length > 0) {
                        if (text.length > 0) {
                            text += '\n';
                        }

                        var line = '';
                        entry.chords.forEach(function (chordInfo) {
                            line = addChord(line, chordInfo);
                        });

                        text += line;
                    }

                    if (entry.lyrics.length > 0 || entry.chords.length === 0) {
                        if (text.length > 0) {
                            text += '\n';
                        }

                        text += entry.lyrics;
                    }
                }
            });

            return text;
        }

        return {
            parse: parse,
            toText: toText
        };
    });
