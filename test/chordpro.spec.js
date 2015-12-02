'use strict';
import { expect } from 'chai';
import * as chordpro from '../lib/chordpro';

describe('chordpro', function() {

  describe('parse', function() {

    describe('lyrics', function() {

      it('should set lyrics line type to "lyrics"', function() {
        var lineInfos = chordpro.parse('[C]one t[D]wo');

        expect(lineInfos.length).to.equal(1);
        expect(lineInfos[0].type).to.equal('lyrics');
      });

      it('should remove chords from text field', function() {
        var lineInfos = chordpro.parse('[C]one t[D]wo');

        expect(lineInfos.length).to.equal(1);
        expect(lineInfos[0].lyrics).to.equal('one two');
      });

      it('should create chord element for each chord', function() {
        var lineInfos = chordpro.parse('[C]one t[D]wo');

        expect(lineInfos.length).to.equal(1);
        expect(lineInfos[0].chords.length).to.equal(2);
        expect(lineInfos[0].chords[0].chord).to.equal('C');
        expect(lineInfos[0].chords[1].chord).to.equal('D');
      });

      it('should set positions for each chord', function() {
        var lineInfos = chordpro.parse('[C]one t[D]wo');

        expect(lineInfos.length).to.equal(1);
        expect(lineInfos[0].chords.length).to.equal(2);
        expect(lineInfos[0].chords[0].pos).to.equal(0);
        expect(lineInfos[0].chords[1].pos).to.equal(5);
      });

      it('should return original text for lyrics line with no chords', function() {
        var lineInfos = chordpro.parse('one two');

        expect(lineInfos.length).to.equal(1);
        expect(lineInfos[0].lyrics).to.equal('one two');
        expect(lineInfos[0].chords.length).to.equal(0);
      });

      it('should return empty text field for empty line', function() {
        var lineInfos = chordpro.parse('');

        expect(lineInfos.length).to.equal(1);
        expect(lineInfos[0].lyrics).to.equal('');
      });

      it('should return empty chords list for empty line', function() {
        var lineInfos = chordpro.parse('');

        expect(lineInfos.length).to.equal(1);
        expect(lineInfos[0].chords.length).to.equal(0);
      });

      it('should return empty text field for line with chords only', function() {
        var lineInfos = chordpro.parse('[C] [D]');

        expect(lineInfos.length).to.equal(1);
        expect(lineInfos[0].lyrics).to.equal('');
      });

      it('should leave at least one space between chords', function() {
        var lineInfos = chordpro.parse('[C] [D]');

        expect(lineInfos.length).to.equal(1);
        expect(lineInfos[0].chords.length).to.equal(2);
        expect(lineInfos[0].chords[0].chord).to.equal('C');
        expect(lineInfos[0].chords[0].pos).to.equal(0);
        expect(lineInfos[0].chords[1].chord).to.equal('D');
        expect(lineInfos[0].chords[1].pos).to.equal(2);
      });

      it('should shift text to accomodate longer chords', function() {
        var lineInfos = chordpro.parse('[Cmin] [Dmin]one');

        expect(lineInfos.length).to.equal(1);
        expect(lineInfos[0].lyrics).to.equal('     one');
        expect(lineInfos[0].chords.length).to.equal(2);
        expect(lineInfos[0].chords[0].chord).to.equal('Cmin');
        expect(lineInfos[0].chords[0].pos).to.equal(0);
        expect(lineInfos[0].chords[1].chord).to.equal('Dmin');
        expect(lineInfos[0].chords[1].pos).to.equal(5);
      });

      it('should allow alpha in chords', function() {
        var lineInfos = chordpro.parse('[C] [D]');

        expect(lineInfos.length).to.equal(1);
        expect(lineInfos[0].chords.length).to.equal(2);
        expect(lineInfos[0].chords[0].chord).to.equal('C');
        expect(lineInfos[0].chords[1].chord).to.equal('D');
      });

      it('should allow numeric in chords', function() {
        var lineInfos = chordpro.parse('[C7] [D7]');

        expect(lineInfos.length).to.equal(1);
        expect(lineInfos[0].chords.length).to.equal(2);
        expect(lineInfos[0].chords[0].chord).to.equal('C7');
        expect(lineInfos[0].chords[1].chord).to.equal('D7');
      });

      it('should allow # in chords', function() {
        var lineInfos = chordpro.parse('[C#] [D7]');

        expect(lineInfos.length).to.equal(1);
        expect(lineInfos[0].chords.length).to.equal(2);
        expect(lineInfos[0].chords[0].chord).to.equal('C#');
        expect(lineInfos[0].chords[1].chord).to.equal('D7');
      });

      it('should allow / in chords', function() {
        var lineInfos = chordpro.parse('[C/D] [D7]');

        expect(lineInfos.length).to.equal(1);
        expect(lineInfos[0].chords.length).to.equal(2);
        expect(lineInfos[0].chords[0].chord).to.equal('C/D');
        expect(lineInfos[0].chords[1].chord).to.equal('D7');
      });

      it('should not allow other special characters in chords', function() {
        var lineInfos = chordpro.parse('[C!] [D]');

        expect(lineInfos.length).to.equal(1);
        expect(lineInfos[0].lyrics).to.equal('[C!]');
        expect(lineInfos[0].chords.length).to.equal(1);
        expect(lineInfos[0].chords[0].chord).to.equal('D');
      });

      it('should handle leading whitespace', function() {
        var lineInfos = chordpro.parse('  [C]one');

        expect(lineInfos.length).to.equal(1);
        expect(lineInfos[0].lyrics).to.equal('  one');
        expect(lineInfos[0].chords.length).to.equal(1);
        expect(lineInfos[0].chords[0].chord).to.equal('C');
        expect(lineInfos[0].chords[0].pos).to.equal(2);
      });

      it('should handle multiple lines', function() {
        var lineInfos = chordpro.parse('[C]one\n[D]two');

        expect(lineInfos.length).to.equal(2);
        expect(lineInfos[0].lyrics).to.equal('one');
        expect(lineInfos[0].chords.length).to.equal(1);
        expect(lineInfos[0].chords[0].chord).to.equal('C');
        expect(lineInfos[1].lyrics).to.equal('two');
        expect(lineInfos[1].chords.length).to.equal(1);
        expect(lineInfos[1].chords[0].chord).to.equal('D');
      });
    })

    describe('directives', function() {});

    describe('comments', function() {});
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
        '<i>C</i>       <i>C/E</i>     <i>F</i>      <i>C</i><br />' +
        'Twinkle twinkle little star<br />' +
        '<i>F</i>     <i>C</i>      <i>G</i>        <i>C</i><br />' +
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
        '<i>C</i>       <i>C/E</i>     <i>F</i>      <i>C</i><br />' +
        'Twinkle twinkle little star<br />' +
        '<i>F</i>     <i>C</i>      <i>G</i>        <i>C</i><br />' +
        'How I wonder what you are' +
        '</pre>');
    });
  });
});
