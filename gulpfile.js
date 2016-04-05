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
watchify = require('watchify'),
del = require('del'),
bower = require('gulp-bower'),
mainBowerFiles = require('main-bower-files'),
source = require('vinyl-source-stream'),
buffer = require('vinyl-buffer'),
browserify = require('browserify'),
babel = require('babelify');


var OPTS = {
  src: {
    html : 'app/**/*.html',
    stylesheets : 'app/styles/*.{scss,css,sass}',
    javascripts : 'app/**/*.js',
    images : 'app/resources/**/*.{png,gif,jpeg,jpg}',
    shaders : 'app/threejs/shaders/**/*.{vs,fs}',
    root : 'app',
    entryPoint : 'app/app.js'
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

gulp.task('default', ['watch', 'watchJS']);

gulp.task('build', ['copyHtml', 'copyImages', 'copyShaders', 'buildStylesheets', 'buildJS']);

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
  browserify({entries:OPTS.src.entryPoint, debug: true })
  .transform(babel)
  .on('error',gutil.log)
  .bundle()
  .on('error',gutil.log)
  .pipe(source('bundle.js'))
  .pipe(sourcemaps.write())
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

gulp.task('watchJS', function() {
  return compile(true);
})


function compile(watch) {
  //var bundler = browserify({entries:OPTS.src.entryPoint, debug: true });

  function rebundle() {
      browserify({entries:OPTS.src.entryPoint, debug: true })
      .transform(babel)
      .on('error',gutil.log)
      .bundle()
      .on('error',gutil.log)
      .pipe(source('bundle.js'))
      .pipe(source('public'))
      // .pipe(buffer())
      // .pipe(sourcemaps.init({ loadMaps: true }))
      // .pipe(sourcemaps.write('./'))
      // .pipe(gulp.dest('./public'));
  }

  // if (watch) {
  //   bundler.on('update', function() {
  //     console.log('-> bundling...');
  //     rebundle();
  //   });
  // }

  rebundle();
}

//######################################################################
// End build tasks
//######################################################################
