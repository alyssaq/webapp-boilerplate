'use strict';

var gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  cache = require('gulp-cache'),
  clean = require('gulp-clean'),
  concat = require('gulp-concat'),
  connect = require('gulp-connect'),
  htmlreplace = require('gulp-html-replace'),
  imagemin = require('gulp-imagemin'),
  jshint = require('gulp-jshint'),
  minifycss = require('gulp-minify-css'),
  notify = require('gulp-notify'),
  pipe = require('multipipe'),
  plumber = require('gulp-plumber'),
  rename = require('gulp-rename'),
  sass = require('gulp-ruby-sass'),
  size = require('gulp-size'),
  uglify = require('gulp-uglify'),
  CFG = {src: 'src/', prod: 'app/'};

function handleError(err) {
  notify({ message: 'ERROR' + err.toString() })
  console.error("ERROR:" + err.toString());
  this.emit('end');
}

function handleChange(event) {
  console.log(event.type + ' ' + event.path);
}

// Styles
gulp.task('styles', function() {
  return pipe(
    gulp.src(CFG.src + 'styles/main.scss'),
    sass({
      style: 'expanded',
      loadPath: [CFG.src + 'bower_components']
    }),
    minifycss(),
    rename({suffix: '.min'}),
    autoprefixer('last 1 version'),
    size(),
    connect.reload(),
    gulp.dest(CFG.prod + 'styles')
  ).on('error', handleError);
});

// Scripts
gulp.task('scripts', function () {
  return pipe(
    gulp.src(CFG.src + 'scripts/**/*.js'),
    jshint('.jshintrc'),
    jshint.reporter('default'),
    concat('main.js'),
    rename({suffix: '.min'}),
    uglify(),
    connect.reload(),
    gulp.dest(CFG.prod + 'scripts')
  ).on('error', handleError);
});

// HTML
gulp.task('html', function () {
  return pipe(
    gulp.src(CFG.src + '*.html'),
    connect.reload(),
    size(),
    gulp.dest(CFG.prod)
  ).on('error', handleError); 
});

// Images
gulp.task('images', function () {
  return pipe(
    gulp.src(CFG.src + 'images/**/*'),
    cache(imagemin({
        optimizationLevel: 3,
        progressive: true,
        interlaced: true
    })),
    connect.reload(),
    size(),
    gulp.dest(CFG.prod + 'images')
  ).on('error', handleError); 
});

// Replace html tags during build
gulp.task('replace', function() {
  return pipe(
    gulp.src(CFG.src + 'index.html'),
    htmlreplace({
        'css': 'styles/main.min.css',
        'js': 'scripts/main.min.js'
    }),
    gulp.dest(CFG.prod)
  ).on('error', handleError);  
});

// Clean
gulp.task('clean', function () {
  return pipe(
    gulp.src([CFG.prod + 'styles', 
              CFG.prod + 'scripts', 
              CFG.prod + 'images',
              '.sass-cache'], 
            {read: false}),
    clean()
  ).on('error', handleError); 
});

gulp.task('connect', connect.server({
  root: [CFG.prod],
  port: 1337,
  livereload: false,
  open: {
    file: 'index.html',
    browser: 'Google Chrome'
  }
}));

// Watch
gulp.task('watch', function () {
    // Watch .html files
    gulp.watch(CFG.src + '*.html', ['html'])
    .on('change', handleChange)

    // Watch .scss files
    gulp.watch(CFG.src + 'styles/**/*.scss', ['styles'])
    .on('change', handleChange)

    // Watch .js files
    gulp.watch(CFG.src + 'scripts/**/*.js', ['scripts'])
    .on('change', handleChange)

    // Watch image files
    gulp.watch(CFG.src + 'images/**/*', ['images'])
    .on('change', handleChange)
});

// Build
gulp.task('build', ['styles', 'scripts', 'images', 'replace']);

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

// Just watching style changes
gulp.task('watchstyles', ['styles', 'connect', 'watch'])

// dev task
gulp.task('dev', ['clean', 'build'], function () {
  gulp.start('connect');
  gulp.start('watch');
});