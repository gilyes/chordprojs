import sanitizeHtml from 'sanitize-html';
import _ from 'underscore';

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
  matches.sort(function(m1, m2) {
    return m1.index - m2.index;
  });

  var fragment;
  var sourcePos = 0;
  var match;
  for (let match of matches) {
    // append lyrics text ending at current match position
    fragment = line.substring(sourcePos, match.index);
    if (fragment) {
      parsedLine.lyrics += fragment;
    }

    if (match.type == 'chord') {
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
      var sourceChord = match[0];
      parsedLine.chords.push({
        pos: parsedLine.lyrics.length,
        value: sourceChord.replace(/[\[\]]/g, '')
      });
      sourcePos = match.index + sourceChord.length;
    } else if (match.type == 'directive') {
      // directive
      var directive = match[0];
      parsedLine.directives.push({
        pos: parsedLine.lyrics.length,
        type: _getDirectiveType(match[1]),
        value: match[2]
      });
      sourcePos = match.index + directive.length;
    }
  }

  // append lyrics text following last chord/directive
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
    html += '</div>'
  }

  return html ? '<div class="line">' + html + '</div>' : "";
}

export function _getSegmentStartIndexes(parsedLine) {
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
    var wordRegex = /(\s*)(\w+)/g;
    var match;
    while (match = wordRegex.exec(parsedLine.lyrics)) {
      var index = indexOfGroup(match, 2);
      if (!_.find(parsedLine.chords, function(chord) {
          return index > chord.pos && index <= chord.pos + chord.value.length;
        })) {
        indexes.push(index);
      }
    }
  }

  // add in chord indexes that are not on word starts
  if (parsedLine.chords) {
    for (let chord of parsedLine.chords) {
      if (!_.contains(indexes, chord.pos)) {
        indexes.push(chord.pos);
      }
    }
  }

  // sort indexes
  indexes.sort(function(i1, i2) {
    return i1 - i2;
  });

  return indexes;
}

export function _getChordHtml(chords, startIndex) {
  var html = '<div class="chord">';
  var chord;
  if (chords) {
    chord = _.find(chords, function(c) {
      return c.pos == startIndex;
    })
  }
  if (chord) {
    html += chord.value;
  } else {
    html += "&nbsp;"
  }
  html += '</div>';
  return html;
}

export function _getLyricsHtml(lyrics, startIndex, endIndex) {
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

export function toHtml(source, css) {

  var newline = '<div class="empty-line"></div>';

  // sanitize input, remove all tags
  source = sanitizeHtml(source, {
    allowedTags: [],
    allowedAttributes: []
  });

  var parsedLines = parse(source);

  var html = '';
  if (css) {
    
  }

  // add title if found
  var title = _getDirectiveValue(parsedLines, 'title');
  if (title) {
    html += '<div class="song-title">' + title + '</div>';
  }

  // add subtitle if found
  var subTitle = _getDirectiveValue(parsedLines, 'subtitle');
  if (subTitle) {
    if (html.length > 0) {
      html += newline;
    }

    html += '<div class="song-subtitle">' + subTitle + '</div>';
  }

  // add empty line after title section
  if (html.length > 0) {
    html += newline;
  }

  parsedLines.forEach(function(parsedLine) {
    // if there is already text and current line is not a directive-only line the insert a new line
    if (html.length > 0 && (parsedLine.lyrics.length > 0 || parsedLine.chords.length > 0 || parsedLine.line.length == 0)) {
      html += newline;
    }

    html += _formatParsedLine(parsedLine, newline);
  });

  return html;
}

function _getDirectiveValue(parsedLines, directiveKey) {
  for (let parsedLine of parsedLines) {
    if (parsedLine.directives) {
      var directive = parsedLine.directives.find(function(element, index, array) {
        return element.type === directiveKey;
      });
      if (directive) {
        return directive.value;
      }
    }
  }
}
