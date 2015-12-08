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
exports.toHtml = toHtml;
exports.getMetadata = getMetadata;

var _sanitizeHtml = require('sanitize-html');

var _sanitizeHtml2 = _interopRequireDefault(_sanitizeHtml);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

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
  var regex = /^\[([a-zA-Z0-9#\/]*)\]/;
  var match = regex.exec(line);
  if (match) {
    return {
      source: match[0],
      value: match[1]
    };
  }
}

function _parseDirective(line) {
  var regex = /^\{\s*([^:}]*)\s*:{0,1}\s*([^:]*?)\s*}/;
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

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = parsedLine[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var parsedLineSegment = _step.value;

      html += '<span class="song-linesegment">';
      if (parsedLineSegment.directive) {
        html += _formatDirective(parsedLineSegment.directive);
      } else {

        if (hasChords) {
          // if there are no chords on this line the do not add any placeholder chords either
          var chord = parsedLineSegment.chord ? parsedLineSegment.chord : ' ';
          html += _formatChord(chord, parsedLineSegment.lyrics && !parsedLineSegment.lyrics.match(/^\s*$/));
        }

        html += _formatLyrics(parsedLineSegment.lyrics);
      }
      html += '</span>';
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

  html += '</span>';
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
  parsedLines.forEach(function (parsedLine) {
    html += _formatParsedLine(parsedLine);
  });

  return html;
}

function getMetadata(source) {
  var metadata = {};

  var parsedLines = parse(source);
  metadata.title = _getDirectiveValue(parsedLines, 'title');
  metadata.subtitle = _getDirectiveValue(parsedLines, 'subtitle');

  return metadata;
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
