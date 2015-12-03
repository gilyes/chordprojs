'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.toText = toText;
exports.toHtml = toHtml;

var _sanitizeHtml = require('sanitize-html');

var _sanitizeHtml2 = _interopRequireDefault(_sanitizeHtml);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(source) {
  var lineInfos = [];

  var commentRegex = /^#.*/;
  source.split('\n').forEach(function (line) {
    if (!line.match(commentRegex)) {
      lineInfos.push(parseLine(line));
    }
  });

  return lineInfos;
}

function parseLine(line) {
  var lineInfo = {
    lyrics: '',
    chords: [],
    directives: []
  };

  var chordRegex = /\[([a-zA-Z0-9#/]+)\]/g;
  var directiveRegex = /\{\s*([^:}]*)\s*:{0,1}\s*([^:]*?)\s*}/g;

  var matches = [];
  while (match = chordRegex.exec(line)) {
    match.type = 'chord';
    matches.push(match);
  }
  while (match = directiveRegex.exec(line)) {
    match.type = 'directive';
    matches.push(match);
  }

  // sort chord/directive matches in ascending order based on index
  matches.sort(function (m1, m2) {
    return m1.index - m2.index;
  });

  var fragment;
  var sourcePos = 0;
  var match;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = matches[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _match = _step.value;

      // append lyrics text ending at current match position
      fragment = line.substring(sourcePos, _match.index);
      if (fragment) {
        lineInfo.lyrics += fragment;
      }

      if (_match.type == 'chord') {
        // determine offset to apply if previous chord is too long and would overlap with current chord
        var offset = 0;
        if (lineInfo.chords.length > 0) {
          var previousChordInfo = lineInfo.chords[lineInfo.chords.length - 1];
          offset = Math.max(0, previousChordInfo.pos + previousChordInfo.value.length + 1 - lineInfo.lyrics.length);
        }

        // pad lyrics field if needed
        for (var i = 0; i < offset; i++) {
          lineInfo.lyrics += ' ';
        }

        // add chord
        var sourceChord = _match[0];
        lineInfo.chords.push({
          pos: lineInfo.lyrics.length,
          value: sourceChord.replace(/[\[\]]/g, '')
        });
        sourcePos = _match.index + sourceChord.length;
      } else if (_match.type == 'directive') {
        // directive
        var directive = _match[0];
        lineInfo.directives.push({
          pos: lineInfo.lyrics.length,
          type: getDirectiveType(_match[1]),
          value: _match[2]
        });
        sourcePos = _match.index + directive.length;
      }
    }

    // append lyrics text following last chord/directive
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  fragment = line.substring(sourcePos, line.length);
  if (fragment) {
    lineInfo.lyrics += fragment;
  }

  // trim end of lyrics text
  lineInfo.lyrics = lineInfo.lyrics.replace(/\s+$/, '');

  return lineInfo;
}

function getDirectiveType(type) {
  type = type.toLowerCase();
  if (type === 't') {
    return 'title';
  } else if (type === 'st') {
    return 'subtitle';
  } else if (type === 'c') {
    return 'comment';
  }
  return type;
}

function formatLyricsEntry(entry, lineEnd, chordFormatter) {

  function addChord(line, chordInfo) {
    // pad the current line up to the chord position
    var strippedLine = line.replace(/(<([^>]+)>)/ig, '');
    var padding = chordInfo.pos - strippedLine.length;
    if (padding > 0) {
      line += Array(padding + 1).join(' ');
    }

    var chord = chordInfo.value;
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
    if (text.length > 0) {
      text += newLine;
    }
    text += formatLyricsEntry(entry, newLine, chordFormatter);
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
    openingPre = '<pre class="' + options.class + '">';
  }

  return (0, _sanitizeHtml2.default)(openingPre + format(source, '<br/>', options.chordFormatter) + '</pre>', {
    allowedAttributes: {
      'pre': ['class']
    }
  });
}