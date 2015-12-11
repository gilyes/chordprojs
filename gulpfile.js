require('babel-core/register');

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  del = require('del'),
  babel = require('gulp-babel'),
  mocha = require('gulp-mocha');

gulp.task('build', function() {
  return gulp.src('lib/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('dist'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('jshint', function() {
  return gulp.src('lib/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
});

gulp.task('test', ['jshint'], function() {
  return gulp.src('test/**/*.js', {
      read: false
    })
    .pipe(mocha({
      reporter: 'spec'
    }));
});

gulp.task('test-watch', function() {
  gulp.watch(['lib/**', 'test/**'], ['test']);
});

gulp.task('clean', function() {
  return del(['dist']);
});

gulp.task('default', ['jshint', 'test', 'clean'], function() {
  gulp.start('build');
});
