'use strict';
import { expect } from 'chai';
import * as chordpro from '../lib/chordpro';

describe('chordpro', function() {

  describe('parse', function() {

    it('should remove chords from lyrics field', function() {
      var parsedLines = chordpro.parse('[C]one t[D]wo');

      expect(parsedLines.length).to.equal(1);
      expect(parsedLines[0].lyrics).to.equal('one two');
    });

    it('should create chord element for each chord', function() {
      var parsedLines = chordpro.parse('[C]one t[D]wo');

      expect(parsedLines.length).to.equal(1);
      expect(parsedLines[0].chords.length).to.equal(2);
      expect(parsedLines[0].chords[0].value).to.equal('C');
      expect(parsedLines[0].chords[1].value).to.equal('D');
    });

    it('should set positions for each chord', function() {
      var parsedLines = chordpro.parse('[C]one t[D]wo');

      expect(parsedLines.length).to.equal(1);
      expect(parsedLines[0].chords.length).to.equal(2);
      expect(parsedLines[0].chords[0].pos).to.equal(0);
      expect(parsedLines[0].chords[1].pos).to.equal(5);
    });

    it('should return original text for lyrics line with no chords', function() {
      var parsedLines = chordpro.parse('one two');

      expect(parsedLines.length).to.equal(1);
      expect(parsedLines[0].lyrics).to.equal('one two');
      expect(parsedLines[0].chords.length).to.equal(0);
    });

    it('should return empty text field for empty line', function() {
      var parsedLines = chordpro.parse('');

      expect(parsedLines.length).to.equal(1);
      expect(parsedLines[0].lyrics).to.equal('');
    });

    it('should return empty chords list for empty line', function() {
      var parsedLines = chordpro.parse('');

      expect(parsedLines.length).to.equal(1);
      expect(parsedLines[0].chords.length).to.equal(0);
    });

    it('should return empty lyrics field for line with chords only', function() {
      var parsedLines = chordpro.parse('[C] [D]');

      expect(parsedLines.length).to.equal(1);
      expect(parsedLines[0].lyrics).to.equal('');
    });

    it('should leave at least one space between chords', function() {
      var parsedLines = chordpro.parse('[C] [D]');

      expect(parsedLines.length).to.equal(1);
      expect(parsedLines[0].chords.length).to.equal(2);
      expect(parsedLines[0].chords[0].value).to.equal('C');
      expect(parsedLines[0].chords[0].pos).to.equal(0);
      expect(parsedLines[0].chords[1].value).to.equal('D');
      expect(parsedLines[0].chords[1].pos).to.equal(2);
    });

    it('should shift text to accomodate longer chords', function() {
      var parsedLines = chordpro.parse('[Cmin] [Dmin]one');

      expect(parsedLines.length).to.equal(1);
      expect(parsedLines[0].lyrics).to.equal('     one');
      expect(parsedLines[0].chords.length).to.equal(2);
      expect(parsedLines[0].chords[0].value).to.equal('Cmin');
      expect(parsedLines[0].chords[0].pos).to.equal(0);
      expect(parsedLines[0].chords[1].value).to.equal('Dmin');
      expect(parsedLines[0].chords[1].pos).to.equal(5);
    });

    it('should allow letters in chords', function() {
      var parsedLines = chordpro.parse('[C] [D]');

      expect(parsedLines.length).to.equal(1);
      expect(parsedLines[0].chords.length).to.equal(2);
      expect(parsedLines[0].chords[0].value).to.equal('C');
      expect(parsedLines[0].chords[1].value).to.equal('D');
    });

    it('should allow numbers in chords', function() {
      var parsedLines = chordpro.parse('[C7] [D7]');

      expect(parsedLines.length).to.equal(1);
      expect(parsedLines[0].chords.length).to.equal(2);
      expect(parsedLines[0].chords[0].value).to.equal('C7');
      expect(parsedLines[0].chords[1].value).to.equal('D7');
    });

    it('should allow # in chords', function() {
      var parsedLines = chordpro.parse('[C#] [D7]');

      expect(parsedLines.length).to.equal(1);
      expect(parsedLines[0].chords.length).to.equal(2);
      expect(parsedLines[0].chords[0].value).to.equal('C#');
      expect(parsedLines[0].chords[1].value).to.equal('D7');
    });

    it('should allow / in chords', function() {
      var parsedLines = chordpro.parse('[C/D] [D7]');

      expect(parsedLines.length).to.equal(1);
      expect(parsedLines[0].chords.length).to.equal(2);
      expect(parsedLines[0].chords[0].value).to.equal('C/D');
      expect(parsedLines[0].chords[1].value).to.equal('D7');
    });

    it('should not allow other special characters in chords', function() {
      var parsedLines = chordpro.parse('[C!] [D]');

      expect(parsedLines.length).to.equal(1);
      expect(parsedLines[0].lyrics).to.equal('[C!]');
      expect(parsedLines[0].chords.length).to.equal(1);
      expect(parsedLines[0].chords[0].value).to.equal('D');
    });

    it('should allow and maintain leading whitespace', function() {
      var parsedLines = chordpro.parse('  [C]one');

      expect(parsedLines.length).to.equal(1);
      expect(parsedLines[0].lyrics).to.equal('  one');
      expect(parsedLines[0].chords.length).to.equal(1);
      expect(parsedLines[0].chords[0].value).to.equal('C');
      expect(parsedLines[0].chords[0].pos).to.equal(2);
    });

    it('should handle multiple lines', function() {
      var parsedLines = chordpro.parse('[C]one\n[D]two');

      expect(parsedLines.length).to.equal(2);
      expect(parsedLines[0].lyrics).to.equal('one');
      expect(parsedLines[0].chords.length).to.equal(1);
      expect(parsedLines[0].chords[0].value).to.equal('C');
      expect(parsedLines[1].lyrics).to.equal('two');
      expect(parsedLines[1].chords.length).to.equal(1);
      expect(parsedLines[1].chords[0].value).to.equal('D');
    });

    it('should set title directive type to "title"', function() {
      var parsedLines = chordpro.parse('{title: Prison Without Walls}');

      expect(parsedLines[0].directives[0].type).to.equal('title');
    });

    it('should set abbreviated title directive type to "title"', function() {
      var parsedLines = chordpro.parse('{t: Prison Without Walls}');

      expect(parsedLines[0].directives[0].type).to.equal('title');
    });

    it('should parse title directive value', function() {
      var parsedLines = chordpro.parse('{title: Prison Without Walls}');

      expect(parsedLines[0].directives[0].value).to.equal('Prison Without Walls');
    });

    it('should parse abbreviated title directive value', function() {
      var parsedLines = chordpro.parse('{t: Prison Without Walls}');

      expect(parsedLines[0].directives[0].value).to.equal('Prison Without Walls');
    });

    it('should set subtitle directive type to "subtitle"', function() {
      var parsedLines = chordpro.parse('{subtitle: Napalm Death}');

      expect(parsedLines[0].directives[0].type).to.equal('subtitle');
    });

    it('should set abbreviated subtitle directive type to "subtitle"', function() {
      var parsedLines = chordpro.parse('{st: Napalm Death}');

      expect(parsedLines[0].directives[0].type).to.equal('subtitle');
    });

    it('should parse subtitle directive value', function() {
      var parsedLines = chordpro.parse('{subtitle: Napalm Death}');

      expect(parsedLines[0].directives[0].value).to.equal('Napalm Death');
    });

    it('should parse abbreviated subtitle directive value', function() {
      var parsedLines = chordpro.parse('{st: Napalm Death}');

      expect(parsedLines[0].directives[0].value).to.equal('Napalm Death');
    });

    it('should set comment directive type to "comment"', function() {
      var parsedLines = chordpro.parse('{c: this is a comment}');

      expect(parsedLines[0].directives[0].type).to.equal('comment');
    });

    it('should parse comment directive value', function() {
      var parsedLines = chordpro.parse('{c: this is a comment}');

      expect(parsedLines[0].directives[0].value).to.equal('this is a comment');
    });

    it('should set start of chorus directive type to "soc"', function() {
      var parsedLines = chordpro.parse('{soc}');

      expect(parsedLines[0].directives[0].type).to.equal('soc');
    });

    it('should set end of chorus directive type to "eoc"', function() {
      var parsedLines = chordpro.parse('{eoc}');

      expect(parsedLines[0].directives[0].type).to.equal('eoc');
    });

    it('should set start of tab directive type to "sot"', function() {
      var parsedLines = chordpro.parse('{sot}');

      expect(parsedLines[0].directives[0].type).to.equal('sot');
    });

    it('should set end of tab directive type to "eot"', function() {
      var parsedLines = chordpro.parse('{eot}');

      expect(parsedLines[0].directives[0].type).to.equal('eot');
    });

    it('should set start of highlight directive type to "soh"', function() {
      var parsedLines = chordpro.parse('{soh}');

      expect(parsedLines[0].directives[0].type).to.equal('soh');
    });

    it('should set end of highlight directive type to "eoh"', function() {
      var parsedLines = chordpro.parse('{eoh}');

      expect(parsedLines[0].directives[0].type).to.equal('eoh');
    });

    it('should parse multiple value-less directives on one line', function() {
      var parsedLines = chordpro.parse('{soh}some text{eoh}');

      expect(parsedLines[0].lyrics).to.equal('some text');
      expect(parsedLines[0].directives.length).to.equal(2);
      expect(parsedLines[0].directives[0].type).to.equal('soh');
      expect(parsedLines[0].directives[0].pos).to.equal(0);
      expect(parsedLines[0].directives[1].type).to.equal('eoh');
      expect(parsedLines[0].directives[1].pos).to.equal(9);
    });

    it('should parse multiple valued directives on one line', function() {
      var parsedLines = chordpro.parse('{c: comment1}some text{c: comment2}');

      expect(parsedLines[0].lyrics).to.equal('some text');
      expect(parsedLines[0].directives.length).to.equal(2);
      expect(parsedLines[0].directives[0].type).to.equal('comment');
      expect(parsedLines[0].directives[0].pos).to.equal(0);
      expect(parsedLines[0].directives[0].value).to.equal('comment1');
      expect(parsedLines[0].directives[1].type).to.equal('comment');
      expect(parsedLines[0].directives[1].pos).to.equal(9);
      expect(parsedLines[0].directives[1].value).to.equal('comment2');
    });

    it('should parse mix of lyrics, chords and directives', function() {
      var parsedLines = chordpro.parse('[C]one {c: some comment}[F]two');

      expect(parsedLines[0].lyrics).to.equal('one two');
      expect(parsedLines[0].chords.length).to.equal(2);
      expect(parsedLines[0].chords[0].value).to.equal('C');
      expect(parsedLines[0].chords[0].pos).to.equal(0);
      expect(parsedLines[0].chords[1].value).to.equal('F');
      expect(parsedLines[0].chords[1].pos).to.equal(4);
      expect(parsedLines[0].directives[0].type).to.equal('comment');
      expect(parsedLines[0].directives[0].value).to.equal('some comment');
      expect(parsedLines[0].directives[0].pos).to.equal(4);
    });

    it('should parse lyrics with directives at end of line', function() {
      var parsedLines = chordpro.parse('[C]one [F]two {c: some comment}');

      expect(parsedLines[0].lyrics).to.equal('one two');
      expect(parsedLines[0].chords.length).to.equal(2);
      expect(parsedLines[0].chords[0].value).to.equal('C');
      expect(parsedLines[0].chords[0].pos).to.equal(0);
      expect(parsedLines[0].chords[1].value).to.equal('F');
      expect(parsedLines[0].chords[1].pos).to.equal(4);
      expect(parsedLines[0].directives[0].type).to.equal('comment');
      expect(parsedLines[0].directives[0].value).to.equal('some comment');
      expect(parsedLines[0].directives[0].pos).to.equal(8);
    });

    it('should parse lyrics with directives at beginning of line', function() {
      var parsedLines = chordpro.parse('{c: some comment}[C]one [F]two');

      expect(parsedLines[0].lyrics).to.equal('one two');
      expect(parsedLines[0].chords.length).to.equal(2);
      expect(parsedLines[0].chords[0].value).to.equal('C');
      expect(parsedLines[0].chords[0].pos).to.equal(0);
      expect(parsedLines[0].chords[1].value).to.equal('F');
      expect(parsedLines[0].chords[1].pos).to.equal(4);
      expect(parsedLines[0].directives[0].type).to.equal('comment');
      expect(parsedLines[0].directives[0].value).to.equal('some comment');
      expect(parsedLines[0].directives[0].pos).to.equal(0);
    });

    it('should ignore comments at beginning of line', function() {
      var parsedLines = chordpro.parse('one\n# comment\ntwo');

      expect(parsedLines.length).to.equal(2);
      expect(parsedLines[0].lyrics).to.equal('one');
      expect(parsedLines[1].lyrics).to.equal('two');
    });

    it('should ignore comments preceded by whitespace only', function() {
      var parsedLines = chordpro.parse('one\n   # comment\ntwo');

      expect(parsedLines.length).to.equal(2);
      expect(parsedLines[0].lyrics).to.equal('one');
      expect(parsedLines[1].lyrics).to.equal('two');
    });

  });

  describe('_getSegmentStartIndexes', function() {

    it('should split up at word starts (no chords, non-empty lyrics)', function() {
      var parsedLine = {
        lyrics: 'one two three'
      };
      var indexes = chordpro._getSegmentStartIndexes(parsedLine);

      expect(indexes.length).to.equal(3);
      expect(indexes).to.eql([0, 4, 8]);
    });

    it('should split up at word starts (chord at word start, non-empty lyrics)', function() {
      var parsedLine = {
        lyrics: 'one two three',
        chords: [{
          value: 'C',
          pos: 4
        }]
      };
      var indexes = chordpro._getSegmentStartIndexes(parsedLine);

      expect(indexes.length).to.equal(3);
      expect(indexes).to.eql([0, 4, 8]);
    });

    it('should split up at word starts and chords (chord not at word start, non-empty lyrics)', function() {
      var parsedLine = {
        lyrics: 'one two three',
        chords: [{
          value: 'C',
          pos: 5
        }]
      };
      var indexes = chordpro._getSegmentStartIndexes(parsedLine);

      expect(indexes.length).to.equal(4);
      expect(indexes).to.eql([0, 4, 5, 8]);
    });

    it('should should skip word start if chord overlaps it', function() {
      var parsedLine = {
        lyrics: 'one two three',
        chords: [{
          value: 'C7',
          pos: 3
        }]
      };
      var indexes = chordpro._getSegmentStartIndexes(parsedLine);

      expect(indexes.length).to.equal(3);
      expect(indexes).to.eql([0, 3, 8]);
    });

    it('should split up at chords (empty lyrics)', function() {
      var parsedLine = {
        chords: [{
          value: 'C',
          pos: 5
        }, {
          value: 'D',
          pos: 7
        }]
      };
      var indexes = chordpro._getSegmentStartIndexes(parsedLine);

      expect(indexes.length).to.equal(2);
      expect(indexes).to.eql([5, 7]);
    });
  });

  describe('_getChordHtml', function() {

    it('should return formatted chord at matching position', function() {
      var chords = [{
        value: 'C',
        pos: 5
      }];
      var html = chordpro._getChordHtml(chords, 5);

      expect(html).to.equal('<div class="chord">C</div>');
    });

    it('should return non-breaking space at non-matching position', function() {
      var chords = [{
        value: 'C',
        pos: 5
      }];
      var html = chordpro._getChordHtml(chords, 4);

      expect(html).to.equal('<div class="chord">&nbsp;</div>');
    });

  });

  describe('_getLyricsHtml', function() {

    it('should return formatted lyrics segment between start and end index', function() {
      var html = chordpro._getLyricsHtml('one two three', 4, 7);

      expect(html).to.equal('<div class="lyrics">two </div>')
    });

    it('should return non-breaking space after lyrics end', function() {
      var html = chordpro._getLyricsHtml('one two three', 13);

      expect(html).to.equal('<div class="lyrics">&nbsp;</div>')
    });

    it('should return text until end of lyrics if endIndex not specified', function() {
      var html = chordpro._getLyricsHtml('one two three', 8);

      expect(html).to.equal('<div class="lyrics">three</div>')
    });
  });

  describe('toHtml', function() {

    it('should display title directive with proper class', function() {
      var source =
        '{t: The Title}\n' +
        'Lyrics go here';

      var result = chordpro.toHtml(source);
      expect(result).to.equal(
        '<div class="song-title-section"><div class="song-title">The Title</div></div><div class="line"><div class="linefragment"><div class="lyrics">Lyrics </div></div><div class="linefragment"><div class="lyrics">go </div></div><div class="linefragment"><div class="lyrics">here</div></div></div>');
    });

    it('should not add chord div if no chords on line', function() {
      var source =
        '{t: The Title}\n' +
        'Lyrics go here';

      var result = chordpro.toHtml(source);
      expect(result).to.equal(
        '<div class="song-title-section"><div class="song-title">The Title</div></div><div class="line"><div class="linefragment"><div class="lyrics">Lyrics </div></div><div class="linefragment"><div class="lyrics">go </div></div><div class="linefragment"><div class="lyrics">here</div></div></div>');
    });

    it('should add chord divs for all segments if there are chords on line', function() {
      var source =
        '{t: The Title}\n' +
        'Lyrics go [C]here';

      var result = chordpro.toHtml(source);
      expect(result).to.equal(
        '<div class="song-title-section"><div class="song-title">The Title</div></div><div class="line"><div class="linefragment"><div class="chord">&nbsp;</div><div class="lyrics">Lyrics </div></div><div class="linefragment"><div class="chord">&nbsp;</div><div class="lyrics">go </div></div><div class="linefragment"><div class="chord">C</div><div class="lyrics">here</div></div></div>');
    });

    it('should not cut off leading [ when not part of a chord', function() {
      var source = '[No chord] Lyrics';

      var result = chordpro.toHtml(source);
      expect(result).to.equal(
        '<div class="line"><div class="linefragment"><div class="lyrics">[No </div></div><div class="linefragment"><div class="lyrics">chord] </div></div><div class="linefragment"><div class="lyrics">Lyrics</div></div></div>');
    });
  });
});
