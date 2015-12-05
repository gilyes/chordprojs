'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports._getSegmentStartIndexes = _getSegmentStartIndexes;
exports._getChordHtml = _getChordHtml;
exports._getLyricsHtml = _getLyricsHtml;
exports.toHtml = toHtml;

var _sanitizeHtml = require('sanitize-html');

var _sanitizeHtml2 = _interopRequireDefault(_sanitizeHtml);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(source) {
  var parsedLines = [];

  var commentRegex = /^\s*#.*/;
  source.split('\n').forEach(function (line) {
    if (!line.match(commentRegex)) {
      parsedLines.push(_parseLine(line));
    }
  });

  return parsedLines;
}

function _parseLine(line) {
  var parsedLine = {
    line: line,
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
        parsedLine.lyrics += fragment;
      }

      if (_match.type == 'chord') {
        // determine offset to apply if previous chord is too long and would overlap with current chord
        var offset = 0;
        if (parsedLine.chords.length > 0) {
          var previousChordInfo = parsedLine.chords[parsedLine.chords.length - 1];
          offset = Math.max(0, previousChordInfo.pos + previousChordInfo.value.length + 1 - parsedLine.lyrics.length);
        }

        // pad lyrics field if needed
        for (var i = 0; i < offset; i++) {
          parsedLine.lyrics += ' ';
        }

        // add chord
        var sourceChord = _match[0];
        parsedLine.chords.push({
          pos: parsedLine.lyrics.length,
          value: sourceChord.replace(/[\[\]]/g, '')
        });
        sourcePos = _match.index + sourceChord.length;
      } else if (_match.type == 'directive') {
        // directive
        var directive = _match[0];
        parsedLine.directives.push({
          pos: parsedLine.lyrics.length,
          type: _getDirectiveType(_match[1]),
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
    parsedLine.lyrics += fragment;
  }

  // trim end of lyrics text
  parsedLine.lyrics = parsedLine.lyrics.replace(/\s+$/, '');

  return parsedLine;
}

function _getDirectiveType(type) {
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

function _formatParsedLine(parsedLine) {
  var indexes = _getSegmentStartIndexes(parsedLine);

  var html = '';
  for (var i = 0; i < indexes.length; i++) {
    html += '<div class="linefragment">';
    if (parsedLine.chords && parsedLine.chords.length) {
      // chord line takes up space even if because it uses &nbsp;, skip if no chords in this line
      html += _getChordHtml(parsedLine.chords, indexes[i]);
    }
    html += _getLyricsHtml(parsedLine.lyrics, indexes[i], i < indexes.length - 1 ? indexes[i + 1] - 1 : null);
    html += '</div>';
  }

  return html ? '<div class="line">' + html + '</div>' : "";
}

function _getSegmentStartIndexes(parsedLine) {
  function indexOfGroup(match, n) {
    var index = match.index;
    for (var i = 1; i < n; i++) {
      index += match[i].length;
    }
    return index;
  }

  var indexes = [];
  // find word starts
  if (parsedLine.lyrics && parsedLine.lyrics.length > 0) {
    var wordRegex = /(\s*)([^\s]+)/g;
    var match;
    while (match = wordRegex.exec(parsedLine.lyrics)) {
      var index = indexOfGroup(match, 2);
      if (!_underscore2.default.find(parsedLine.chords, function (chord) {
        return index > chord.pos && index <= chord.pos + chord.value.length;
      })) {
        indexes.push(index);
      }
    }
  }

  // add in chord indexes that are not on word starts
  if (parsedLine.chords) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = parsedLine.chords[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var chord = _step2.value;

        if (!_underscore2.default.contains(indexes, chord.pos)) {
          indexes.push(chord.pos);
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }

  // sort indexes
  indexes.sort(function (i1, i2) {
    return i1 - i2;
  });

  return indexes;
}

function _getChordHtml(chords, startIndex) {
  var html = '<div class="chord">';
  var chord;
  if (chords) {
    chord = _underscore2.default.find(chords, function (c) {
      return c.pos == startIndex;
    });
  }
  if (chord) {
    html += chord.value;
  } else {
    html += "&nbsp;";
  }
  html += '</div>';
  return html;
}

function _getLyricsHtml(lyrics, startIndex, endIndex) {
  var html = '<div class="lyrics">';
  if (startIndex > lyrics.length - 1) {
    html += '&nbsp;';
  } else {
    if (!endIndex) {
      endIndex = lyrics.length - 1;
    }
    html += lyrics.substring(startIndex, endIndex + 1);
  }
  html += '</div>';
  return html;
}

function toHtml(source) {

  // sanitize input, remove all tags
  source = (0, _sanitizeHtml2.default)(source, {
    allowedTags: [],
    allowedAttributes: []
  });

  var parsedLines = parse(source);

  var html = '';

  // add title and subtitle if found
  var title = _getDirectiveValue(parsedLines, 'title');
  var subTitle = _getDirectiveValue(parsedLines, 'subtitle');
  if (title || subTitle) {
    html += '<div class="song-title-section">';
    if (title) {
      html += '<div class="song-title">' + title + '</div>';
    }
    if (subTitle) {
      html += '<div class="song-subtitle">' + subTitle + '</div>';
    }
    html += '</div>';
  }

  parsedLines.forEach(function (parsedLine) {
    html += _formatParsedLine(parsedLine);
  });

  return html;
}

function _getDirectiveValue(parsedLines, directiveKey) {
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = parsedLines[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var parsedLine = _step3.value;

      if (parsedLine.directives) {
        var directive = parsedLine.directives.find(function (element, index, array) {
          return element.type === directiveKey;
        });
        if (directive) {
          return directive.value;
        }
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }
}