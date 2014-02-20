'use strict';

var gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  cache = require('gulp-cache'),
  clean = require('gulp-clean'),
  concat = require('gulp-concat'),
  connect = require('gulp-connect'),
  gutil = require('gulp-util'),
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
  uglify = require('gulp-uglify');

//Config for source and production folder
var  CFG = {src: 'src/', prod: 'app/', isProduction: true};

function handleError(err) {
  notify.onError('<%= err.message %>')()
  console.error("ERROR: " + err.toString());
  this.emit('end');
}

function handleChange(event) {
  console.log(event.type + ' ' + event.path);
}

// Compile scss to css, minify and copy
gulp.task('styles', function() {
  return pipe(
    gulp.src(CFG.src + 'styles/main.scss'),
    sass({
      style: CFG.isProduction ? 'compressed' : 'expanded',
      loadPath: [CFG.src + 'bower_components']
    }),
    CFG.isProduction ? minifycss() : gutil.noop(),
    rename({suffix: '.min'}),
    autoprefixer('last 1 version'),
    size(),
    connect.reload(),
    gulp.dest(CFG.prod + 'styles')
  ).on('error', handleError)
   .on('error', notify.onError('<%= error.message %>'));
});

// Minify and copy all Javascript files (except vendor)
gulp.task('scripts', function () {
  return pipe(
    gulp.src(CFG.src + 'scripts/**/*.js'),
    jshint('.jshintrc'),
    jshint.reporter('default'),
    concat('main.min.js'),
    CFG.isProduction ? uglify() : gutil.noop(),
    connect.reload(),
    gulp.dest(CFG.prod + 'scripts')
  ).on('error', handleError);
});

// Copy vendor scripts
gulp.task('vendorscripts', function () {
  pipe(
    gulp.src(CFG.src + 'bower_components/jquery/jquery.min.js'),
    gulp.dest(CFG.prod + 'scripts/vendor')
  ).on('error', handleError);

  var base = CFG.src + 'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap'
  pipe(
    gulp.src([base + '/tooltip.js', base + '/button.js']),
    concat('bootstrap.min.js'),
    uglify(),
    gulp.dest(CFG.prod + 'scripts/vendor')
  ).on('error', handleError);
});

// Copy HTML files
gulp.task('html', function () {
  return pipe(
    gulp.src(CFG.src + '404.html'),
    connect.reload(),
    size(),
    gulp.dest(CFG.prod)
  ).on('error', handleError);
});

// Compress and copy static images
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

// Replace build blocks in HTML to scripts or styles
gulp.task('replace', function() {
  return pipe(
    gulp.src(CFG.src + 'index.html'),
    htmlreplace({
      'css': 'styles/main.min.css',
      'scripts': 'scripts/main.min.js',
      'vendorscripts': ['scripts/vendor/jquery.min.js', 'scripts/vendor/bootstrap.min.js']
    }),
    gulp.dest(CFG.prod)
  ).on('error', handleError); 
});

// Delete files
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

gulp.task('connect', ['build'], connect.server({
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
    gulp.watch(CFG.src + '*.html', ['html', 'replace'])
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
gulp.task('build', ['html', 'vendorscripts', 'styles', 'scripts', 'images', 'replace']);

// Just watching style changes
gulp.task('watchstyles', ['styles', 'connect', 'watch'])

// Default task: Production mode
gulp.task('default', ['clean'], function () {
  CFG.isProduction = true;
  gulp.start('build');
});

// Task: Development mode
gulp.task('dev', ['clean'], function () {
  CFG.isProduction = false;
  gulp.start('build')
  gulp.start('connect');
  gulp.start('watch');
});