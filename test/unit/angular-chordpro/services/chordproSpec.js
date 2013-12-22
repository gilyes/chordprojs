'use strict';

describe('Services: chordpro', function () {

    beforeEach(module('angular-chordpro.services'));

    var chordpro;
    beforeEach(inject(function (_chordpro_) {
        chordpro = _chordpro_;
    }));

    describe('parse', function () {

        describe('lyrics', function () {

            it('should set lyrics line type to "lyrics"', function () {
                var lineInfos = chordpro.parse('[C]one t[D]wo');

                expect(lineInfos.length).toBe(1);
                expect(lineInfos[0].type).toBe('lyrics');
            });

            it('should remove chords from text field', function () {
                var lineInfos = chordpro.parse('[C]one t[D]wo');

                expect(lineInfos.length).toBe(1);
                expect(lineInfos[0].lyrics).toBe('one two');
            });

            it('should create chord element for each chord', function () {
                var lineInfos = chordpro.parse('[C]one t[D]wo');

                expect(lineInfos.length).toBe(1);
                expect(lineInfos[0].chords.length).toBe(2);
                expect(lineInfos[0].chords[0].chord).toBe('C');
                expect(lineInfos[0].chords[1].chord).toBe('D');
            });

            it('should set positions for each chord', function () {
                var lineInfos = chordpro.parse('[C]one t[D]wo');

                expect(lineInfos.length).toBe(1);
                expect(lineInfos[0].chords.length).toBe(2);
                expect(lineInfos[0].chords[0].pos).toBe(0);
                expect(lineInfos[0].chords[1].pos).toBe(5);
            });

            it('should return original text for lyrics line with no chords', function () {
                var lineInfos = chordpro.parse('one two');

                expect(lineInfos.length).toBe(1);
                expect(lineInfos[0].lyrics).toBe('one two');
                expect(lineInfos[0].chords.length).toBe(0);
            });

            it('should return empty text field for empty line', function () {
                var lineInfos = chordpro.parse('');

                expect(lineInfos.length).toBe(1);
                expect(lineInfos[0].lyrics).toBe('');
            });

            it('should return empty chords list for empty line', function () {
                var lineInfos = chordpro.parse('');

                expect(lineInfos.length).toBe(1);
                expect(lineInfos[0].chords.length).toBe(0);
            });

            it('should return empty text field for line with chords only', function () {
                var lineInfos = chordpro.parse('[C] [D]');

                expect(lineInfos.length).toBe(1);
                expect(lineInfos[0].lyrics).toBe('');
            });

            it('should leave at least one space between chords', function () {
                var lineInfos = chordpro.parse('[C] [D]');

                expect(lineInfos.length).toBe(1);
                expect(lineInfos[0].chords.length).toBe(2);
                expect(lineInfos[0].chords[0].chord).toBe('C');
                expect(lineInfos[0].chords[0].pos).toBe(0);
                expect(lineInfos[0].chords[1].chord).toBe('D');
                expect(lineInfos[0].chords[1].pos).toBe(2);
            });

            it('should shift text to accomodate longer chords', function () {
                var lineInfos = chordpro.parse('[Cmin] [Dmin]one');

                expect(lineInfos.length).toBe(1);
                expect(lineInfos[0].lyrics).toBe('     one');
                expect(lineInfos[0].chords.length).toBe(2);
                expect(lineInfos[0].chords[0].chord).toBe('Cmin');
                expect(lineInfos[0].chords[0].pos).toBe(0);
                expect(lineInfos[0].chords[1].chord).toBe('Dmin');
                expect(lineInfos[0].chords[1].pos).toBe(5);
            });

            it('should allow alpha in chords', function () {
                var lineInfos = chordpro.parse('[C] [D]');

                expect(lineInfos.length).toBe(1);
                expect(lineInfos[0].chords.length).toBe(2);
                expect(lineInfos[0].chords[0].chord).toBe('C');
                expect(lineInfos[0].chords[1].chord).toBe('D');
            });

            it('should allow numeric in chords', function () {
                var lineInfos = chordpro.parse('[C7] [D7]');

                expect(lineInfos.length).toBe(1);
                expect(lineInfos[0].chords.length).toBe(2);
                expect(lineInfos[0].chords[0].chord).toBe('C7');
                expect(lineInfos[0].chords[1].chord).toBe('D7');
            });

            it('should allow # in chords', function () {
                var lineInfos = chordpro.parse('[C#] [D7]');

                expect(lineInfos.length).toBe(1);
                expect(lineInfos[0].chords.length).toBe(2);
                expect(lineInfos[0].chords[0].chord).toBe('C#');
                expect(lineInfos[0].chords[1].chord).toBe('D7');
            });

            it('should allow / in chords', function () {
                var lineInfos = chordpro.parse('[C/D] [D7]');

                expect(lineInfos.length).toBe(1);
                expect(lineInfos[0].chords.length).toBe(2);
                expect(lineInfos[0].chords[0].chord).toBe('C/D');
                expect(lineInfos[0].chords[1].chord).toBe('D7');
            });

            it('should not allow other special characters in chords', function () {
                var lineInfos = chordpro.parse('[C!] [D]');

                expect(lineInfos.length).toBe(1);
                expect(lineInfos[0].lyrics).toBe('[C!]');
                expect(lineInfos[0].chords.length).toBe(1);
                expect(lineInfos[0].chords[0].chord).toBe('D');
            });

            it('should handle leading whitespace', function () {
                var lineInfos = chordpro.parse('  [C]one');

                expect(lineInfos.length).toBe(1);
                expect(lineInfos[0].lyrics).toBe('  one');
                expect(lineInfos[0].chords.length).toBe(1);
                expect(lineInfos[0].chords[0].chord).toBe('C');
                expect(lineInfos[0].chords[0].pos).toBe(2);
            });

            it('should handle multiple lines', function () {
                var lineInfos = chordpro.parse('[C]one\n[D]two');

                expect(lineInfos.length).toBe(2);
                expect(lineInfos[0].lyrics).toBe('one');
                expect(lineInfos[0].chords.length).toBe(1);
                expect(lineInfos[0].chords[0].chord).toBe('C');
                expect(lineInfos[1].lyrics).toBe('two');
                expect(lineInfos[1].chords.length).toBe(1);
                expect(lineInfos[1].chords[0].chord).toBe('D');
            });
        })

        describe('directives', function () {
        });

        describe('comments', function () {
        });
    });

    describe('toText', function () {

        it('should format source', function () {
            var source =
                '[C]Twinkle [C/E]twinkle [F]little [C]star\n' +
                    '[F]How I [C]wonder [G]what you [C]are';

            var result = chordpro.toText(source);
            expect(result).toBe(
                'C       C/E     F      C\n' +
                    'Twinkle twinkle little star\n' +
                    'F     C      G        C\n' +
                    'How I wonder what you are');
        });

        it('should maintain empty lines', function () {
            var source =
                '[C]Twinkle [C/E]twinkle [F]little [C]star\n\n' +
                    '[F]How I [C]wonder [G]what you [C]are';

            var result = chordpro.toText(source);
            expect(result).toBe(
                'C       C/E     F      C\n' +
                    'Twinkle twinkle little star\n\n' +
                    'F     C      G        C\n' +
                    'How I wonder what you are');
        });
    });

    describe('toHtml', function () {

        it('should format source', function () {
            var source =
                '[C]Twinkle [C/E]twinkle [F]little [C]star\n' +
                    '[F]How I [C]wonder [G]what you [C]are';

            var result = chordpro.toHtml(source, {
                chordFormatter: function (chord) { return '<i>' + chord + '</i>';}
            });

            expect(result).toBe(
                '<pre>' +
                    '<i>C</i>       <i>C/E</i>     <i>F</i>      <i>C</i><br/>' +
                    'Twinkle twinkle little star<br/>' +
                    '<i>F</i>     <i>C</i>      <i>G</i>        <i>C</i><br/>' +
                    'How I wonder what you are' +
                    '</pre>');
        });

        it('should add pre class if specified', function () {
            var source =
                '[C]Twinkle [C/E]twinkle [F]little [C]star\n' +
                    '[F]How I [C]wonder [G]what you [C]are';

            var result = chordpro.toHtml(source, {
                chordFormatter: function (chord) { return '<i>' + chord + '</i>';},
                class: 'test'
            });

            expect(result).toBe(
                '<pre class="test">' +
                    '<i>C</i>       <i>C/E</i>     <i>F</i>      <i>C</i><br/>' +
                    'Twinkle twinkle little star<br/>' +
                    '<i>F</i>     <i>C</i>      <i>G</i>        <i>C</i><br/>' +
                    'How I wonder what you are' +
                    '</pre>');
        });
    });
});