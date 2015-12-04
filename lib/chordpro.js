import sanitizeHtml from 'sanitize-html';

export function parse(source) {
  var parsedLines = [];

  var commentRegex = /^\s*#.*/;
  source.split('\n').forEach(function(line) {
    if (!line.match(commentRegex)) {
      parsedLines.push(parseLine(line));
    }
  });

  return parsedLines;
}

function parseLine(line) {
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
        type: getDirectiveType(match[1]),
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

function formatParsedLine(parsedLine, options) {

  function addChord(line, chordInfo) {
    // pad the current line up to the chord position
    var strippedLine = line.replace(/(<([^>]+)>)/ig, '');
    var padding = chordInfo.pos - strippedLine.length;
    if (padding > 0) {
      line += Array(padding + 1).join(' ');
    }

    var chord = chordInfo.value;
    if (options && options.chordFormatter) {
      chord = options.chordFormatter(chord);
    }

    line += chord;
    return line;
  }

  var text = '';

  // TODO: process other directives (title/subtitle processed separately)
  for (let directive of parsedLine.directives) {}

  // add chord line if available
  if (parsedLine.chords.length > 0) {
    if (text.length > 0) {
      text += options.newLine;
    }

    var line = '';
    parsedLine.chords.forEach(function(chordInfo) {
      line = addChord(line, chordInfo);
    });

    text += line;
  }

  // add lyrics line if available, or empty line if no chords/directives and no lyrics
  if (parsedLine.lyrics.length > 0 || (parsedLine.chords.length === 0 && parsedLine.directives.length === 0)) {
    if (text.length > 0) {
      text += options.newLine;
    }

    text += parsedLine.lyrics;
  }

  return text;
}

function format(source, options) {

  // sanitize input, remove all tags
  source = sanitizeHtml(source, {
    allowedTags: [],
    allowedAttributes: []
  });

  var parsedLines = parse(source);

  if (!options) {
    options = {};
  }

  if (!options.newLine) {
    options.newLine = '\n'
  }

  // add title if found
  var text = '';
  var title = getDirectiveValue(parsedLines, 'title');
  if (title) {
    if (options && options.titleFormatter) {
      title = options.titleFormatter(title);
    }
    text += title;
  }

  // add subtitle if found
  var subTitle = getDirectiveValue(parsedLines, 'subtitle');
  if (subTitle) {
    if (text.length > 0) {
      text += options.newLine;
    }

    if (options && options.subtitleFormatter) {
      subTitle = options.subtitleFormatter(subTitle);
    }
    text += subTitle;
  }

  // add empty line after title section
  if (text.length > 0) {
    text += options.newLine;
  }

  parsedLines.forEach(function(parsedLine) {
    // if there is already text and current line is empty or has lyrics and/or chords then start on a new line
    if (text.length > 0 && (parsedLine.lyrics.length > 0 || parsedLine.chords.length > 0 || parsedLine.line.length == 0)) {
      text += options.newLine;
    }

    text += formatParsedLine(parsedLine, options);
  });

  return text;
}

function getDirectiveValue(parsedLines, directiveKey) {
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

export function toText(source) {
  return format(source);
}

export function toHtml(source, options) {
  if (!options) {
    options = {};
  }

  if (!options.chordFormatter) {
    options.chordFormatter = function(chord) {
      return '<b>' + chord + '</b>';
    };
  }

  if (!options.titleFormatter) {
    options.titleFormatter = function(title) {
      return '<h1>' + title + '</h1>';
    };
  }

  if (!options.subtitleFormatter) {
    options.subtitleFormatter = function(subtitle) {
      return '<h2>' + subtitle + '</h2>';
    };
  }

  if (!options.newLine) {
    options.newLine = "<br/>"
  }

  var openingPre = '<pre>';
  if (options.class) {
    openingPre = '<pre class="' + options.class + '">';
  }

  return openingPre + format(source, options) + '</pre>';
}
