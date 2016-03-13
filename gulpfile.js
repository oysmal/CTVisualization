/* File: gulpfile.js */

// grab our gulp packages
var gulp  = require('gulp'),
gutil = require('gulp-util'),
jshint = require('gulp-jshint'),
sass = require('gulp-sass'),
sourcemaps = require('gulp-sourcemaps'),
uglify = require('gulp-uglify'),
ngAnnotate = require('gulp-ng-annotate'),
concat = require('gulp-concat'),
del = require('del'),
bower = require('gulp-bower'),
mainBowerFiles = require('main-bower-files');


var OPTS = {
  src: {
    html : 'app/**/*.html',
    stylesheets : 'app/styles/*.{scss,css,sass}',
    javascripts : 'app/**/*.js',
    images : 'app/resources/**/*.{png,gif,jpeg,jpg}',
    shaders : 'app/threejs/shaders/**/*.{vs,fs}',
    root : 'app'
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

// create a default task and just log a message
gulp.task('default', ['watch'] , function() {
  return gutil.log('Gulp is running!')
});

gulp.task('build', ['copyHtml', 'copyImages', 'copyShaders', 'buildStylesheets', 'buildJS', 'bower-files']);

// configure the jshint task
gulp.task('jshint', function() {
  return gulp.src(OPTS.src.javascripts)
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'));
});

// configure which files to watch and what tasks to use on file changes
gulp.task('watch', function() {
  gulp.watch(OPTS.src.root, ['jshint']);
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

gulp.task('buildStylesheets', function() {
  return gulp.src(OPTS.src.stylesheets)
  .pipe(sourcemaps.init())  // Process the original sources
//  .pipe(sass())
  .pipe(sourcemaps.write())  // Process the original sources
  .pipe(gulp.dest(OPTS.dest.stylesheets));
});

gulp.task('buildJS', function() {
  return gulp.src(OPTS.src.javascripts)
  .pipe(sourcemaps.init())
  .pipe(concat(OPTS.dest.bundleName))
  //only uglify if gulp is ran with '--type production'
  .pipe(ngAnnotate())
  .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(OPTS.dest.root));
});

gulp.task("bower-files", function(){
    return gulp.src(mainBowerFiles())
    .pipe(gulp.dest(OPTS.dest.bower));
});

gulp.task('clean:public', function () {
  return del([
    'public/*'
  ]);
});

//######################################################################
// End build tasks
//######################################################################
