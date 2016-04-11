/* File: gulpfile.js */

// grab our gulp packages
var gulp  = require('gulp'),
gutil = require('gulp-util'),
eslint = require('gulp-eslint'),
sass = require('gulp-sass'),
sourcemaps = require('gulp-sourcemaps'),
uglify = require('gulp-uglify'),
ngAnnotate = require('gulp-ng-annotate'),
concat = require('gulp-concat'),
del = require('del'),
bower = require('gulp-bower'),
mainBowerFiles = require('main-bower-files'),
source = require('vinyl-source-stream'),
buffer = require('vinyl-buffer'),
browserify = require('browserify'),
babelify = require('babelify'),
fs = require("fs");


var OPTS = {
  src: {
    html : 'app/**/*.html',
    stylesheets : 'app/styles/*.{scss,css,sass}',
    javascripts : 'app/**/*.{js,es6}',
    libs : 'app/lib/*.{js,es6}',
    images : 'app/resources/**/*.{png,gif,jpeg,jpg}',
    shaders : 'app/threejs/shaders/**/*.{vs,fs}',
    root : 'app',
    entryPoint : 'app/app.es6'
  },
  dest: {
    html : 'public',
    stylesheets : 'public/assets/stylesheets',
    images : 'public/assets/images',
    shaders : 'public/assets/shaders',
    bundleName : 'bundle.min.js',
    bower : 'public/lib',
    root : 'public'
  }
};

gulp.task('default', ['watch']);

gulp.task('build', ['copyHtml', 'copyImages', 'copyShaders', 'buildStylesheets', 'buildJS', 'bower-files', 'copyLibs']);

// configure the jshint task
gulp.task('lint', function() {
  return gulp.src(OPTS.src.javascripts)
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
});

// configure which files to watch and what tasks to use on file changes
gulp.task('watch', function() {
  gulp.watch(OPTS.src.javascripts, ['lint', 'buildJS']);
  gulp.watch(OPTS.src.stylesheets, ['buildStylesheets']);
});

//######################################################################
// Build tasks
//######################################################################

gulp.task('copyHtml', function() {
  return gulp.src(OPTS.src.html).pipe(gulp.dest(OPTS.dest.html));
});

gulp.task('copyImages', function() {
  return gulp.src(OPTS.src.images).pipe(gulp.dest(OPTS.dest.images));
});

gulp.task('copyShaders', function() {
  return gulp.src(OPTS.src.shaders).pipe(gulp.dest(OPTS.dest.shaders));
});

gulp.task('copyLibs', function() {
  return gulp.src(OPTS.src.libs).pipe(gulp.dest(OPTS.dest.bower));
});

gulp.task('buildStylesheets', function() {
  return gulp.src(OPTS.src.stylesheets)
  .pipe(sass())
  .pipe(gulp.dest(OPTS.dest.stylesheets));
});

gulp.task('buildJS', function() {
  browserify({debug: true })
  .transform(babelify, {extensions: ['.es6']})
  .require(OPTS.src.entryPoint, {entry: true})
  .bundle()
  .on('error',gutil.log)
  .pipe(source('bundle.js'))
  .pipe(gulp.dest(OPTS.dest.root));
});

gulp.task("bower-files", function(){
    return gulp.src(mainBowerFiles())
    .pipe(gulp.dest(OPTS.dest.bower));
});

gulp.task('clean:public', function () {
  return del([
    'public/[^.]*'
  ]);
});

//######################################################################
// End build tasks
//######################################################################
