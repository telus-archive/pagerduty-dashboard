// gulp build configuration
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('browserify');
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var scss = require('gulp-sass');
var source = require('vinyl-source-stream');

var STATIC_ASSETS = 'client/public_html/**';
var DESTINATION_ROOT = 'public_html';

gulp.task('fonts', function () {
  return gulp.src('node_modules/bootstrap/fonts/*')
    .pipe(gulp.dest(DESTINATION_ROOT + '/fonts/bootstrap'));
});

gulp.task('static', function () {
  return gulp.src(STATIC_ASSETS)
    .pipe(gulp.dest(DESTINATION_ROOT));
});

gulp.task('js', function () {
  return browserify('./client/app.js')
    .bundle()
    .on('error', function (error) {
      console.log(error.message);
      this.emit('end');
    })
    .pipe(source('dashboard.js'))
    .pipe(gulp.dest(DESTINATION_ROOT));
});

gulp.task('scss', function () {
  return gulp.src('client/dashboard.scss')
   .pipe(scss({
     includePaths: [
       'node_modules/bootstrap-sass/assets/stylesheets'
     ]
   }).on('error', scss.logError))
   .pipe(autoprefixer({
     browsers: ['last 2 versions']
   }))
   .pipe(gulp.dest(DESTINATION_ROOT + '/assets'));
});

gulp.task('nodemon', function () {
  nodemon({
    script: 'server/main.js',
    watch: ['server', 'config.json'],
    ext: 'js json'
  });
});

gulp.task('watch', function () {
  gulp.watch(STATIC_ASSETS, ['static']);
  gulp.watch('client/**/*.js', ['js']);
  gulp.watch('client/**/*.scss', ['scss']);
});

gulp.task('build', ['fonts', 'static', 'js', 'scss']);
gulp.task('dev', ['build', 'nodemon', 'watch']);
gulp.task('default', ['build']);
