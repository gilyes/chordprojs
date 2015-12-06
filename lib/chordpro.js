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
      var sourceChord = match[0];
      parsedLine.chords.push({
        pos: parsedLine.lyrics.length,
        value: sourceChord.replace(/[\[\]]/g, '')
      });
      sourcePos = match.index + sourceChord.length;
    } else if (match.type == 'directive') {
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

  if (parsedLine.line.length == 0) {
    return '<div class="line"><div class="linefragment"><div class="lyrics">&nbsp;</div></div></div>';
  }

  var html = '';
  var hasLyrics = !parsedLine.lyrics.match(/^\s*$/);
  for (var i = 0; i < indexes.length; i++) {
    html += '<div class="linefragment">';
    if (parsedLine.chords && parsedLine.chords.length) {
      if (!hasLyrics && i > 0) {
        // if no lyrics, insert a spacer before current chord
        console.log(i, indexes[i], indexes[i - 1])
        html += _getChordSpacerHtml(indexes[i] - indexes[i - 1] - parsedLine.chords[i-1].value.length+1);
      }
      // if there are any chords on this line, add a div for each segment (on empty an &nbsp; will be inserted)
      html += _getChordHtml(parsedLine.chords, indexes[i]);
    }
    if (hasLyrics) {
      // if not chords-only, add lyrics div
      html += _getLyricsHtml(parsedLine.lyrics, indexes[i], i < indexes.length - 1 ? indexes[i + 1] - 1 : null);
    }

    // TODO: directives

    html += '</div>'
  }

  return html ? '<div class="line">' + html + '</div>' : '';
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
  if (parsedLine.lyrics) {
    var wordRegex = /(\s*)([^\s]+)/g;
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
    // pad lyrics with non-breaking spaces to maintain spacing between chords at end of line
    for (var i = lyrics.length - 1; i < startIndex; i++) {
      html += '&nbsp;';
    }
  } else {
    if (!endIndex) {
      endIndex = lyrics.length - 1;
    }
    html += lyrics.substring(startIndex, endIndex + 1);
  }
  html += '</div>';
  return html;
}

function _getChordSpacerHtml(count) {
  var html = '<div class="chord-spacer">';
  for (var i = 0; i < count; i++) {
    html += '&nbsp;';
  }
  html += '</div>';
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

  parsedLines.forEach(function(parsedLine) {
    html += _formatParsedLine(parsedLine);
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
