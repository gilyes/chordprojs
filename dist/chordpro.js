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

var chordRegex = /\[([a-zA-Z0-9#/]+)\]/g;
var directiveRegex = /\{\s*([^:]*)\s*:{0,1}\s*([^:]*?)\s*}/;
var commentRegex = /^#/;

function parse(source) {
  var lineInfos = [];

  source.split('\n').forEach(function (line) {

    var lineInfo;
    if (line.match(commentRegex)) {
      // skip comments
    } else if (line.match(directiveRegex)) {
        lineInfo = parseDirectiveLine(line);
      } else if (line.match(chordRegex)) {
        lineInfo = parseLyricsLineWithChords(line);
      } else {
        lineInfo = parseStraightLyricsLine(line);
      }

    if (lineInfo) {
      lineInfos.push(lineInfo);
    }
  });

  return lineInfos;
}

function parseDirectiveLine(line) {
  var match = line.match(directiveRegex);
  if (match.length === 3) {
    var key = match[1].toLowerCase();
    var value = match[2];
    if (key === 'title' || key === 't') {
      return {
        type: 'title',
        value: value
      };
    } else if (key === 'subtitle' || key === 'st') {
      return {
        type: 'subtitle',
        value: value
      };
    } else if (key === 'comment' || key === 'c') {
      return {
        type: 'comment',
        value: value
      };
    } else if (value === '') {
      return {
        type: key
      };
    }
  }
}

function parseLyricsLineWithChords(line) {
  var lineInfo = {
    type: 'lyrics',
    lyrics: '',
    chords: []
  };

  var fragment;
  var sourcePos = 0;
  var match;
  while (match = chordRegex.exec(line)) {

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

  return lineInfo;
}

function parseStraightLyricsLine(line) {
  return {
    type: 'lyrics',
    lyrics: line,
    chords: []
  };
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
    openingPre = '<pre class="' + options.class + '">';
  }

  return (0, _sanitizeHtml2.default)(openingPre + format(source, '<br/>', options.chordFormatter) + '</pre>', {
    allowedAttributes: {
      'pre': ['class']
    }
  });
}