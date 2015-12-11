import sanitizeHtml from 'sanitize-html';
import _ from 'lodash';

export function parse(source) {
  var parsedLines = [];

  var commentRegex = /^\s*#.*/;
  var isBetweenTabDirectives = false;
  source.split('\n').forEach(function(line) {
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
  for (let parsedLineSegment of parsedLine) {
    if (parsedLineSegment.directive && parsedLineSegment.directive.type === directiveType) {
      return true;
    }
  }
}

function _getDirectiveValue(parsedLines, directiveType) {
  for (let parsedLine of parsedLines) {
    for (let parsedLineSegment of parsedLine) {
      if (parsedLineSegment.directive && parsedLineSegment.directive.type === directiveType) {
        return parsedLineSegment.directive.value;
      }
    }
  }
}

function _getUsedChords(parsedLines) {
  var chords = [];
  for (let parsedLine of parsedLines) {
    for (let parsedLineSegment of parsedLine) {
      if (parsedLineSegment.chord && parsedLineSegment.chord.value && !_.find(chords, function(chord) {
          return chord.toUpperCase() === parsedLineSegment.chord.value.toUpperCase();
        })) {
        chords.push(parsedLineSegment.chord.value);
      }
    }
  }
}

export function _parseLine(line) {
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

export function _parseChord(line) {
  var regex = /^\[([a-zA-Z0-9#+\/]*)\]/;
  var match = regex.exec(line);
  if (match) {
    return {
      source: match[0],
      value: match[1]
    };
  }
}

export function _parseDirective(line) {
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

export function _parseWord(line) {
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

export function _parseWhitespace(line) {
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

  var hasChords = _.find(parsedLine, function(parsedLine) {
    return parsedLine.chord;
  });

  for (let parsedLineSegment of parsedLine) {
    html += '<span class="song-linesegment">';
    if (parsedLineSegment.directive) {
      html += _formatDirective(parsedLineSegment.directive);
    } else {

      // only add chord or placeholder if there are any chords on this line
      if (hasChords) {
        var chord = parsedLineSegment.chord ? parsedLineSegment.chord : ' ';
        html += _formatChord(chord, parsedLineSegment.lyrics && !parsedLineSegment.lyrics.match(/^\s*$/));
      }

      html += _formatLyrics(parsedLineSegment.lyrics);
    }
    html += '</span>';
  }

  html += '</span>';
  return html;
}

export function format(source) {
  // sanitize input, remove all tags
  source = sanitizeHtml(source, {
    allowedTags: [],
    allowedAttributes: []
  });

  var parseResult = parse(source);
  return formatParseResult(parseResult);
}

export function formatParseResult(parseResult) {
  var html = '';

  parseResult.parsedLines.forEach(function(parsedLine) {
    html += _formatParsedLine(parsedLine);
  });

  return {
    html: html,
    parseResult: parseResult
  };
}
