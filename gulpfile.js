var browserify = require('browserify');
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var source = require('vinyl-source-stream');

var STATIC_ASSETS = 'client/public_html/**';
var DESTINATION_ROOT = 'public_html';

gulp.task('copy-fonts', function () {
  return gulp.src('node_modules/bootstrap/fonts/*')
    .pipe(gulp.dest(DESTINATION_ROOT + '/fonts'));
});

gulp.task('copy-static', function () {
  return gulp.src(STATIC_ASSETS)
    .pipe(gulp.dest(DESTINATION_ROOT));
});

gulp.task('dev-server', function () {
  nodemon({
    script: 'app.js',
    watch: ['server', 'app.js', 'config.json'],
    ext: 'js json'
  });
});

gulp.task('watch', function () {
  gulp.watch(STATIC_ASSETS, ['copy-static']);
  gulp.watch('client/**/*.js', ['js']);
});

gulp.task('js', function () {
  return browserify('./client/app.js')
  .bundle()
  .pipe(source('dashboard.js'))
  .pipe(gulp.dest(DESTINATION_ROOT));
});

gulp.task('build', [
  'copy-static',
  'copy-fonts',
  'js'
]);
gulp.task('dev', ['build', 'dev-server', 'build-js-dashboard-dev', 'watch']);
gulp.task('default', ['build']);
