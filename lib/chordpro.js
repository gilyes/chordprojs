import sanitizeHtml from 'sanitize-html';
import _ from 'lodash';

export function parse(source) {
  var parsedLines = [];

  var commentRegex = /^\s*#.*/;
  source.split('\n').forEach(function(line) {
    if (!line.match(commentRegex)) {
      parsedLines.push(_parseLine(line));
    }
  });

  return parsedLines;
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
        }
      }
    }

    parsedLine.push(segment);
  }

  return parsedLine;
}

export function _parseChord(line, regex) {
  var regex = /^\[([a-zA-Z0-9#\/]*)\]/;
  var match = regex.exec(line);
  if (match) {
    return {
      source: match[0],
      value: match[1]
    };
  }
}

export function _parseDirective(line, regex) {
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

export function _parseWord(line, regex) {
  var regex = /^([^\s\[\{]*)/;
  var match = regex.exec(line);
  if (match) {
    return match[1];
  }
}

export function _parseWhitespace(line, regex) {
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
      return '<span class="song-title">' + directive.value + '</span>'
    case 'subtitle':
      return '<span class="song-subtitle">' + directive.value + '</span>'
    case 'comment':
      return '<span class="song-comment">' + title + '</span>'
    case 'soc':
      return '<div class="song-soc">'
    case 'eoc':
      return '</div>'
    case 'soh':
      return '<div class="song-soh">'
    case 'eoh':
      return '</div>'
    default:
      return '';
  }
}

function _formatChord(chord) {
  return '<span class="song-chord">' + chord + '</span>';
}

function _formatLyrics(lyrics) {
  if (!lyrics) {
    lyrics = ' '
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

      if (hasChords) {
        // if there are no chords on this line the do not add any placeholder chords either
        var chord = parsedLineSegment.chord ? parsedLineSegment.chord : ' ';
        html += _formatChord(chord);
      }

      html += _formatLyrics(parsedLineSegment.lyrics);
    }
    html += '</span>';
  }

  html += '</span>';
  return html;
}

export function toHtml(source) {

  // sanitize input, remove all tags
  source = sanitizeHtml(source, {
    allowedTags: [],
    allowedAttributes: []
  });

  var parsedLines = parse(source);

  var html = '';
  parsedLines.forEach(function(parsedLine) {
    html += _formatParsedLine(parsedLine);
  });

  return html;
}

export function getMetadata(source) {
  var metadata = {};

  var parsedLines = parse(source);
  metadata.title = _getDirectiveValue(parsedLines, 'title');
  metadata.subtitle = _getDirectiveValue(parsedLines, 'subtitle');

  return metadata;
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
