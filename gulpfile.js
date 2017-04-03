const gulp = require('gulp');
const ts = require('gulp-typescript');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const sass = require('gulp-sass');
const server = require('gulp-server-livereload');

gulp.task('generate_javascript_files', () => {
  return gulp.src('ts/**/*.ts')
    .pipe(ts({
      noImplicitAny: true
    }))
    .pipe(gulp.dest('gen/js'));
});

gulp.task('generate_javascript_bundle', ['generate_javascript_files'], () => {
  return gulp.src('gen/js/**/*.js')
    .pipe(webpackStream({
      output: {
        filename: 'app.bundle.js'
      }
    }, webpack))
    .on('error', console.error.bind(console))
    .pipe(gulp.dest('public/js'));
});

gulp.task('generate_css', () => {
  gulp.src('sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css/'));
});

gulp.task('webserver', ['generate_javascript_bundle', 'generate_css'], () => {
  gulp.src('public')
    .pipe(server({
      livereload: true,
      open: true
    }));
  gulp.watch('ts/**/*.ts', ['generate_javascript_bundle']);
  gulp.watch('sass/**/*.scss', ['generate_css']);
});
