var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var nodemon = require('gulp-nodemon');
var plumber = require('gulp-plumber');
var insert = require('gulp-insert');
var less = require('gulp-less');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');

var SOURCE_DIR = 'client';
var JS_SOURCES = SOURCE_DIR + '/**/*.js';
var HTML_SOURCES = SOURCE_DIR + '/**/*.html';
var LESS_SOURCES = SOURCE_DIR + '/**/*.less';
var PUBLIC_DIR = 'public_html';
var ASSETS_DIR = 'public_html/assets';

gulp.task('copy-fonts', function() {
  return gulp.src('node_modules/bootstrap/fonts/*')
    .pipe(gulp.dest(PUBLIC_DIR + '/fonts'));
});

gulp.task('copy-html', function() {
  return gulp.src(HTML_SOURCES)
    .pipe(gulp.dest(PUBLIC_DIR));
});

gulp.task('build-js-dashboard', function() {
  return gulp.src(JS_SOURCES)
    .pipe(plumber())
    .pipe(ngAnnotate())
    .pipe(concat('dashboard.js'))
    .pipe(insert.wrap('(function(){', '})();'))
    .pipe(uglify())
    .pipe(gulp.dest(ASSETS_DIR));
});

gulp.task('build-js-dashboard-dev', function() {
  return gulp.src(JS_SOURCES)
    .pipe(plumber())
    .pipe(ngAnnotate())
    .pipe(concat('dashboard.js'))
    .pipe(insert.wrap('(function(){', '})();'))
    .pipe(gulp.dest(ASSETS_DIR));
});

gulp.task('build-js-libs', function() {
  return gulp.src([
      'node_modules/jquery/dist/jquery.js',
      'node_modules/salvattore/dist/salvattore.js',
      'node_modules/angular/angular.js',
      'node_modules/noty/js/noty/packaged/jquery.noty.packaged.js',
      'node_modules/bootstrap/dist/js/bootstrap.js',
      'node_modules/angular-route/angular-route.js'
    ])
    .pipe(uglify())
    .pipe(concat('libs.js'))
    .pipe(gulp.dest(ASSETS_DIR));
});

gulp.task('build-css-libs', function() {
  return gulp.src([
      'node_modules/bootstrap/dist/css/bootstrap.css',
      'node_modules/bootstrap/dist/css/bootstrap-theme.css',
    ])
    .pipe(concat('libs.css'))
    .pipe(cssmin())
    .pipe(gulp.dest(ASSETS_DIR));
});

gulp.task('build-css-dashboard', function() {
  return gulp.src(LESS_SOURCES)
    .pipe(plumber())
    .pipe(less({
      paths: ['node_modules/bootstrap/less']
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(cssmin())
    .pipe(gulp.dest(ASSETS_DIR));
});

gulp.task('dev-server', function() {
  nodemon({
    script: 'app.js',
    watch: ['server', 'app.js', 'config.json'],
    ext: 'js json'
  });
});

gulp.task('watch', function() {
  gulp.watch(HTML_SOURCES, ['copy-html']);
  gulp.watch(JS_SOURCES, ['build-js-dashboard-dev']);
  gulp.watch(LESS_SOURCES, ['build-css-dashboard']);
});

gulp.task('build', [
  'copy-fonts',
  'copy-html',
  'build-js-dashboard',
  'build-js-libs',
  'build-css-libs',
  'build-css-dashboard'
]);
gulp.task('dev', ['build', 'dev-server', 'build-js-dashboard-dev', 'watch']);
gulp.task('default', ['build']);
