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

  describe('toText', function() {

    it('should format source', function() {
      var source =
        '[C]Twinkle [C/E]twinkle [F]little [C]star\n' +
        '[F]How I [C]wonder [G]what you [C]are';

      var result = chordpro.toText(source);
      expect(result).to.equal(
        'C       C/E     F      C\n' +
        'Twinkle twinkle little star\n' +
        'F     C      G        C\n' +
        'How I wonder what you are');
    });

    it('should maintain empty lines', function() {
      var source =
        '[C]Twinkle [C/E]twinkle [F]little [C]star\n\n' +
        '[F]How I [C]wonder [G]what you [C]are';

      var result = chordpro.toText(source);
      expect(result).to.equal(
        'C       C/E     F      C\n' +
        'Twinkle twinkle little star\n\n' +
        'F     C      G        C\n' +
        'How I wonder what you are');
    });

    it('should display title directive with empty line after', function() {
      var source =
        '{t: The Title}\n' +
        'Lyrics go here';

      var result = chordpro.toText(source);
      expect(result).to.equal(
        'The Title\n\n' +
        'Lyrics go here');
    });

    it('should display subtitle directive with empty line after', function() {
      var source =
        '{st: The Subtitles}\n' +
        'Lyrics go here';

      var result = chordpro.toText(source);
      expect(result).to.equal(
        'The Subtitles\n\n' +
        'Lyrics go here');
    });

    it('should display title/subtitle directives with empty line after', function() {
      var source =
        '{t: The Title}\n' +
        '{st: The Subtitles}\n' +
        'Lyrics go here';

      var result = chordpro.toText(source);
      expect(result).to.equal(
        'The Title\n' +
        'The Subtitles\n\n' +
        'Lyrics go here');
    });
  });

  describe('toHtml', function() {

    it('should format source', function() {
      var source =
        '[C]Twinkle [C/E]twinkle [F]little [C]star\n' +
        '[F]How I [C]wonder [G]what you [C]are';

      var result = chordpro.toHtml(source, {
        chordFormatter: function(chord) {
          return '<i>' + chord + '</i>';
        }
      });

      expect(result).to.equal(
        '<pre>' +
        '<i>C</i>       <i>C/E</i>     <i>F</i>      <i>C</i><br/>' +
        'Twinkle twinkle little star<br/>' +
        '<i>F</i>     <i>C</i>      <i>G</i>        <i>C</i><br/>' +
        'How I wonder what you are' +
        '</pre>');
    });

    it('should add pre class if specified', function() {
      var source =
        '[C]Twinkle [C/E]twinkle [F]little [C]star\n' +
        '[F]How I [C]wonder [G]what you [C]are';

      var result = chordpro.toHtml(source, {
        chordFormatter: function(chord) {
          return '<i>' + chord + '</i>';
        },
        class: 'test'
      });

      expect(result).to.equal(
        '<pre class="test">' +
        '<i>C</i>       <i>C/E</i>     <i>F</i>      <i>C</i><br/>' +
        'Twinkle twinkle little star<br/>' +
        '<i>F</i>     <i>C</i>      <i>G</i>        <i>C</i><br/>' +
        'How I wonder what you are' +
        '</pre>');
    });

    it('should display title directive with h1 tag by default', function() {
      var source =
        '{t: The Title}\n' +
        'Lyrics go here';

      var result = chordpro.toHtml(source);
      expect(result).to.equal(
        '<pre><h1>The Title</h1><br/><br/>' +
        'Lyrics go here</pre>');
    });

    it('should display subtitle directive with h2 tag by default', function() {
      var source =
        '{st: The Subtitles}\n' +
        'Lyrics go here';

      var result = chordpro.toHtml(source);
      expect(result).to.equal(
        '<pre><h2>The Subtitles</h2><br/><br/>' +
        'Lyrics go here</pre>');
    });
  });
});
