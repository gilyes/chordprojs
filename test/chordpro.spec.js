'use strict';
import {
  expect
}
from 'chai';
import * as chordpro from '../lib/chordpro';

describe('chordpro', function() {

  describe('_parseChord', function() {

    it('should parse one-letter chord', function() {
      var chord = chordpro._parseChord('[C]');

      expect(chord.source).to.equal('[C]');
      expect(chord.value).to.equal('C');
    });

    it('should parse multi-letter chord', function() {
      var chord = chordpro._parseChord('[Cm]');

      expect(chord.source).to.equal('[Cm]');
      expect(chord.value).to.equal('Cm');
    });

    it('should parse bass chord', function() {
      var chord = chordpro._parseChord('[C/F]');

      expect(chord.source).to.equal('[C/F]');
      expect(chord.value).to.equal('C/F');
    });

    it('should parse sharp chord', function() {
      var chord = chordpro._parseChord('[C#]');

      expect(chord.source).to.equal('[C#]');
      expect(chord.value).to.equal('C#');
    });

    it('should parse chord followed by whitespace', function() {
      var chord = chordpro._parseChord('[C#] ');

      expect(chord.source).to.equal('[C#]');
      expect(chord.value).to.equal('C#');
    });

    it('should parse chord followed by letters', function() {
      var chord = chordpro._parseChord('[C#]one');

      expect(chord.source).to.equal('[C#]');
      expect(chord.value).to.equal('C#');
    });

    it('should return undefined for non-chord', function() {
      var chord = chordpro._parseChord('one');

      expect(chord).to.equal(undefined);
    });

    it('should return undefined for invalid characters in chord', function() {
      var chord = chordpro._parseChord('[C!]');

      expect(chord).to.equal(undefined);
    });

  });

  describe('_parseDirective', function() {

    it('should parse title directive', function() {
      var directive = chordpro._parseDirective('{title: The Title}');

      expect(directive.source).to.equal('{title: The Title}');
      expect(directive.type).to.equal('title');
      expect(directive.value).to.equal('The Title');
    });

    it('should parse abbreviated title directive', function() {
      var directive = chordpro._parseDirective('{t: The Title}');

      expect(directive.source).to.equal('{t: The Title}');
      expect(directive.type).to.equal('title');
      expect(directive.value).to.equal('The Title');
    });

    it('should parse subtitle directive', function() {
      var directive = chordpro._parseDirective('{subtitle: The Subtitles}');

      expect(directive.source).to.equal('{subtitle: The Subtitles}');
      expect(directive.type).to.equal('subtitle');
      expect(directive.value).to.equal('The Subtitles');
    });

    it('should parse abbreviated subtitle directive', function() {
      var directive = chordpro._parseDirective('{st: The Subtitles}');

      expect(directive.source).to.equal('{st: The Subtitles}');
      expect(directive.type).to.equal('subtitle');
      expect(directive.value).to.equal('The Subtitles');
    });

    it('should parse comment directive', function() {
      var directive = chordpro._parseDirective('{c: this is a comment}');

      expect(directive.source).to.equal('{c: this is a comment}');
      expect(directive.type).to.equal('comment');
      expect(directive.value).to.equal('this is a comment');
    });

    it('should parse directives with no value', function() {
      var directive = chordpro._parseDirective('{soc}');

      expect(directive.source).to.equal('{soc}');
      expect(directive.type).to.equal('soc');
      expect(directive.value).to.equal('');
    });

    it('should return undefined for not directive', function() {
      var directive = chordpro._parseDirective('not a directive');

      expect(directive).to.equal(undefined);
    });

  });

  describe('_parseWord', function() {

    it('should parse word', function() {
      var word = chordpro._parseWord("some words")

      expect(word).to.equal("some");
    });

    it('should parse word', function() {
      var word = chordpro._parseWord("[")

      expect(word).to.equal("[");
    });

    it('should return empty for whitespace', function() {
      var word = chordpro._parseWord(" some words")

      expect(word).to.equal('');
    });

    it('should return undefined for chord', function() {
      var word = chordpro._parseWord("[A]some words")

      expect(word).to.equal(undefined);
    });

    it('should return undefined for directive', function() {
      var word = chordpro._parseWord("{soc}")

      expect(word).to.equal(undefined);
    });
  });

  describe('_parseWhitespace', function() {

    it('should parse whitespace', function() {
      var word = chordpro._parseWhitespace("   some words")

      expect(word).to.equal('   ');
    });

    it('should return empty for word', function() {
      var word = chordpro._parseWhitespace("some words")

      expect(word).to.equal('');
    });

    it('should return empty for chord', function() {
      var word = chordpro._parseWhitespace("[A]some words")

      expect(word).to.equal('');
    });

    it('should return empty for directive', function() {
      var word = chordpro._parseWhitespace("{soc}")

      expect(word).to.equal('');
    });
  });

  describe('_parseLine', function() {

    it('should parse usual mix of lyrics and chords', function() {
      var parsedLine = chordpro._parseLine('[C]one [D]two');

      expect(parsedLine.length).to.equal(3);
      expect(parsedLine[0].lyrics).to.equal('one');
      expect(parsedLine[0].chord).to.equal('C');
      expect(parsedLine[0].directive).to.equal(undefined);
      expect(parsedLine[1].lyrics).to.equal(' ');
      expect(parsedLine[1].chord).to.equal(undefined);
      expect(parsedLine[1].directive).to.equal(undefined);
      expect(parsedLine[2].lyrics).to.equal('two');
      expect(parsedLine[2].chord).to.equal('D');
      expect(parsedLine[2].directive).to.equal(undefined);
    });

    it('should maintain whitespace at front of line', function() {
      var parsedLine = chordpro._parseLine('   [C]one');

      expect(parsedLine.length).to.equal(2);
      expect(parsedLine[0].lyrics).to.equal('   ');
      expect(parsedLine[0].chord).to.equal(undefined);
      expect(parsedLine[0].directive).to.equal(undefined);
      expect(parsedLine[1].lyrics).to.equal('one');
      expect(parsedLine[1].chord).to.equal('C');
      expect(parsedLine[1].directive).to.equal(undefined);
    });

    it('should maintain whitespace before chords at end of line', function() {
      var parsedLine = chordpro._parseLine('one   [C]   [D]');

      expect(parsedLine.length).to.equal(4);
      expect(parsedLine[0].lyrics).to.equal('one');
      expect(parsedLine[0].chord).to.equal(undefined);
      expect(parsedLine[1].lyrics).to.equal('   ');
      expect(parsedLine[1].chord).to.equal(undefined);
      expect(parsedLine[2].lyrics).to.equal('   ');
      expect(parsedLine[2].chord).to.equal('C');
      expect(parsedLine[3].lyrics).to.equal(undefined);
      expect(parsedLine[3].chord).to.equal('D');
    });

    it('should return lyrics field with one non-breaking space for empty line', function() {
      var parsedLine = chordpro._parseLine('');

      expect(parsedLine.length).to.equal(1);
      expect(parsedLine[0].lyrics).to.equal('&nbsp;');
      expect(parsedLine[0].chord).to.equal(undefined);
    });

    it('should parse multiple value-less directives on one line', function() {
      var parsedLine = chordpro._parseLine('{soh}some text{eoh}');

      expect(parsedLine.length).to.equal(5);
      expect(parsedLine[0].directive.type).to.equal('soh');
      expect(parsedLine[1].lyrics).to.equal('some');
      expect(parsedLine[2].lyrics).to.equal(' ');
      expect(parsedLine[3].lyrics).to.equal('text');
      expect(parsedLine[4].directive.type).to.equal('eoh');
    });

    it('should parse multiple valued directives on one line', function() {
      var parsedLine = chordpro._parseLine('{c: comment1}some text{c: comment2}');

      expect(parsedLine.length).to.equal(5);
      expect(parsedLine[0].directive.type).to.equal('comment');
      expect(parsedLine[0].directive.value).to.equal('comment1');
      expect(parsedLine[1].lyrics).to.equal('some');
      expect(parsedLine[2].lyrics).to.equal(' ');
      expect(parsedLine[3].lyrics).to.equal('text');
      expect(parsedLine[4].directive.type).to.equal('comment');
      expect(parsedLine[4].directive.value).to.equal('comment2');
    });
  });

  describe('parse', function() {

    it('should handle multiple lines', function() {
      var parsedLines = chordpro.parse('[C]one\n[D]two');

      expect(parsedLines.length).to.equal(2);
      expect(parsedLines[0][0].chord).to.equal('C');
      expect(parsedLines[0][0].lyrics).to.equal('one');
      expect(parsedLines[1][0].chord).to.equal('D');
      expect(parsedLines[1][0].lyrics).to.equal('two');
    });

    it('should ignore comments at beginning of line', function() {
      var parsedLines = chordpro.parse('one\n# comment\ntwo');

      expect(parsedLines.length).to.equal(2);
      expect(parsedLines[0][0].lyrics).to.equal('one');
      expect(parsedLines[1][0].lyrics).to.equal('two');
    });

    it('should ignore comments preceded by whitespace only', function() {
      var parsedLines = chordpro.parse('one\n   # comment\ntwo');

      expect(parsedLines.length).to.equal(2);
      expect(parsedLines[0][0].lyrics).to.equal('one');
      expect(parsedLines[1][0].lyrics).to.equal('two');
    });

  });

  describe('toHtml', function() {

    it('should display title directive with proper class', function() {
      var source = '{t: The Title}';

      var result = chordpro.toHtml(source);
      expect(result).to.equal('<span class="song-line"><span class="song-linesegment"><span class="song-title">The Title</span></span></span>');
    });

    it('should not add chord span if no chords on line', function() {
      var source = 'Lyrics';

      var result = chordpro.toHtml(source);
      expect(result).to.equal('<span class="song-line"><span class="song-linesegment"><span class="song-lyrics">Lyrics</span></span></span>');
    });

    it('should add chord spans for all segments if there are chords on line', function() {
      var source ='Lyrics [C]here';

      var result = chordpro.toHtml(source);
      expect(result).to.equal(
        '<span class="song-line"><span class="song-linesegment"><span class="song-chord"> </span><span class="song-lyrics">Lyrics</span></span><span class="song-linesegment"><span class="song-chord"> </span><span class="song-lyrics song-lyrics-whitespace"> </span></span><span class="song-linesegment"><span class="song-chord">C</span><span class="song-lyrics">here</span></span></span>');
    });

    // it('should not add lyrics spans if only chords on a line', function() {
    //   var source = '[Am7][B]';
    //
    //   var result = chordpro.toHtml(source);
    //   expect(result).to.not.contain('lyrics');
    // });
    //
    // it('should keep spacing between chords with no lyrics', function() {
    //   var source = '[A]     [B]';
    //
    //   var result = chordpro.toHtml(source);
    //   expect(result).to.equal(
    //     '<span class="line"><span class="linesegment"><span class="chord">A</span></span><span class="linesegment"><span class="chord"><span class="chord-spacer">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>B</span></span></span>');
    // });
    //
    // it('should keep spacing between chords at end of a line', function() {
    //   var source = 'one[A]    [B]';
    //
    //   var result = chordpro.toHtml(source);
    //   expect(result).to.equal(
    //     '<span class="line"><span class="linesegment"><span class="chord">&nbsp;</span><span class="lyrics">one</span></span><span class="linesegment"><span class="chord">A</span><span class="lyrics-placeholder">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span><span class="linesegment"><span class="chord">B</span><span class="lyrics-placeholder">&nbsp;</span></span></span>');
    // });
    //
    // it('should maintain empty lines', function() {
    //   var source = 'line1\n\nline2';
    //
    //   var result = chordpro.toHtml(source);
    //   expect(result).to.equal(
    //     '<span class="line"><span class="linesegment"><span class="lyrics">line1</span></span></span><span class="line"><span class="linesegment"><span class="lyrics">&nbsp;</span></span></span><span class="line"><span class="linesegment"><span class="lyrics">line2</span></span></span>');
    // });
  });

  describe('getMetadata', function() {

    it('should return title when present', function() {
      var metadata = chordpro.getMetadata('{t: The Title}');

      expect(metadata.title).to.equal('The Title');
    });

    it('should return subtitle when present', function() {
      var metadata = chordpro.getMetadata('{st: The Subtitles}');

      expect(metadata.subtitle).to.equal('The Subtitles');
    });

    it('should return both title and subtitle when present', function() {
      var metadata = chordpro.getMetadata('{t: The Title}\n{st: The Subtitles}');

      expect(metadata.title).to.equal('The Title');
      expect(metadata.subtitle).to.equal('The Subtitles');
    });

  });
});
