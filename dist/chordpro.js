'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports._parseLine = _parseLine;
exports._parseChord = _parseChord;
exports._parseDirective = _parseDirective;
exports._parseWord = _parseWord;
exports._parseWhitespace = _parseWhitespace;
exports.format = format;
exports.formatParseResult = formatParseResult;

var _sanitizeHtml = require('sanitize-html');

var _sanitizeHtml2 = _interopRequireDefault(_sanitizeHtml);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(source) {
  var parsedLines = [];

  var commentRegex = /^\s*#.*/;
  var isBetweenTabDirectives = false;
  source.split('\n').forEach(function (line) {
    if (!line.match(commentRegex)) {
      var parsedLine = _parseLine(line);

      if (_hasDirective(parsedLine, 'sot')) {
        isBetweenTabDirectives = true;
      } else if (_hasDirective(parsedLine, 'eot')) {
        isBetweenTabDirectives = false;
      } else {
        if (isBetweenTabDirectives) {
          parsedLine = [];
          parsedLine.push({
            lyrics: line
          });
        }
      }

      parsedLines.push(parsedLine);
    }
  });

  return {
    parsedLines: parsedLines,
    title: _getDirectiveValue(parsedLines, 'title'),
    subTitle: _getDirectiveValue(parsedLines, 'subtitle'),
    usedChords: _getUsedChords(parsedLines)
  };
}

function _hasDirective(parsedLine, directiveType) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = parsedLine[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var parsedLineSegment = _step.value;

      if (parsedLineSegment.directive && parsedLineSegment.directive.type === directiveType) {
        return true;
      }
    }
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
}

function _getDirectiveValue(parsedLines, directiveType) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = parsedLines[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var parsedLine = _step2.value;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = parsedLine[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var parsedLineSegment = _step3.value;

          if (parsedLineSegment.directive && parsedLineSegment.directive.type === directiveType) {
            return parsedLineSegment.directive.value;
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

function _getUsedChords(parsedLines) {
  var chords = [];
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = parsedLines[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var parsedLine = _step4.value;
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        var _loop = function _loop() {
          var parsedLineSegment = _step5.value;

          if (parsedLineSegment.chord && parsedLineSegment.chord.value && !_lodash2.default.find(chords, function (chord) {
            return chord.toUpperCase() === parsedLineSegment.chord.value.toUpperCase();
          })) {
            chords.push(parsedLineSegment.chord.value);
          }
        };

        for (var _iterator5 = parsedLine[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }
}

function _parseLine(line) {
  var parsedLine = [];

  if (line === '') {
    parsedLine.push({
      lyrics: '&nbsp;'
    });
  }

  var index = 0;
  while (index < line.length) {
    var segment = {};

    var directive = _parseDirective(line.substring(index, line.length));
    if (directive) {
      segment.directive = directive;
      index += directive.source.length;
    } else {
      var chord = _parseChord(line.substring(index, line.length));
      if (chord) {
        segment.chord = chord.value;
        index += chord.source.length;
      }

      var whitespace = _parseWhitespace(line.substring(index, line.length));
      if (whitespace) {
        segment.lyrics = whitespace;
        index += whitespace.length;
      } else {
        var word = _parseWord(line.substring(index, line.length));
        if (word) {
          segment.lyrics = word;
          index += word.length;
        } else if (!chord) {
          // should not get here, but just in case...
          index++;
        }
      }
    }

    parsedLine.push(segment);
  }

  return parsedLine;
}

function _parseChord(line) {
  var regex = /^\[([a-zA-Z0-9#+\/]*)\]/;
  var match = regex.exec(line);
  if (match) {
    return {
      source: match[0],
      value: match[1]
    };
  }
}

function _parseDirective(line) {
  var regex = /^\{\s*([^:}]*)\s*:{0,1}\s*(.*?)\s*}/;
  var match = regex.exec(line);
  if (match) {
    return {
      source: match[0],
      type: _getDirectiveType(match[1]),
      value: match[2]
    };
  }
}

function _parseWord(line) {
  // allow word starting with [ or { but only if not part of a chord/directive.
  if (_parseChord(line) || _parseDirective(line)) {
    return undefined;
  }

  var regex = /^([\[\{]?[^\s\[\{]*)/;
  var match = regex.exec(line);
  if (match) {
    return match[1];
  }
}

function _parseWhitespace(line) {
  var regex = /^([\s]*)/;
  var match = regex.exec(line);
  if (match) {
    return match[1];
  }
}

function _getDirectiveType(type) {
  type = type.toLowerCase();
  switch (type) {
    case 't':
      return 'title';
    case 'st':
      return 'subtitle';
    case 'c':
      return 'comment';
    default:
      return type;
  }
}

function _formatDirective(directive) {
  switch (directive.type) {
    case 'title':
      return '<span class="song-title">' + directive.value + '</span>';
    case 'subtitle':
      return '<span class="song-subtitle">' + directive.value + '</span>';
    case 'comment':
      return '<span class="song-comment">' + directive.value + '</span>';
    case 'soc':
      return '<div class="song-soc">';
    case 'eoc':
      return '</div>';
    case 'soh':
      return '<div class="song-soh">';
    case 'eoh':
      return '</div>';
    case 'sot':
      return '<div class="song-sot">';
    case 'eot':
      return '</div>';
    default:
      return '';
  }
}

function _formatChord(chord, hasLyrics) {
  if (hasLyrics || chord == ' ') {
    return '<span class="song-chord">' + chord + '</span>';
  } else {
    return '<span class="song-chord-nolyrics">' + chord + '</span>';
  }
}

function _formatLyrics(lyrics) {
  if (!lyrics) {
    lyrics = ' ';
  }

  var isWhitespace = lyrics.match(/^\s*$/);

  return '<span class="song-lyrics' + (isWhitespace ? ' song-lyrics-whitespace">' : '">') + lyrics + '</span>';
}

function _formatParsedLine(parsedLine) {
  var html = '';
  html += '<span class="song-line">';

  var hasChords = _lodash2.default.find(parsedLine, function (parsedLine) {
    return parsedLine.chord;
  });

  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = parsedLine[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var _parsedLineSegment = _step6.value;

      html += '<span class="song-linesegment">';
      if (_parsedLineSegment.directive) {
        html += _formatDirective(_parsedLineSegment.directive);
      } else {

        // only add chord or placeholder if there are any chords on this line
        if (hasChords) {
          var chord = _parsedLineSegment.chord ? _parsedLineSegment.chord : ' ';
          html += _formatChord(chord, _parsedLineSegment.lyrics && !_parsedLineSegment.lyrics.match(/^\s*$/));
        }

        html += _formatLyrics(_parsedLineSegment.lyrics);
      }
      html += '</span>';
    }
  } catch (err) {
    _didIteratorError6 = true;
    _iteratorError6 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion6 && _iterator6.return) {
        _iterator6.return();
      }
    } finally {
      if (_didIteratorError6) {
        throw _iteratorError6;
      }
    }
  }

  html += '</span>';
  return html;
}

function format(source) {
  // sanitize input, remove all tags
  source = (0, _sanitizeHtml2.default)(source, {
    allowedTags: [],
    allowedAttributes: []
  });

  var parseResult = parse(source);
  return formatParseResult(parseResult);
}

function formatParseResult(parseResult) {
  var html = '';

  parseResult.parsedLines.forEach(function (parsedLine) {
    html += _formatParsedLine(parsedLine);
  });

  return {
    html: html,
    parseResult: parseResult
  };
}