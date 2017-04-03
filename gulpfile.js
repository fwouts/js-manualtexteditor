const gulp = require('gulp');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const sass = require('gulp-sass');
const server = require('gulp-server-livereload');

gulp.task('generate_javascript', () => {
  return gulp.src('js/app.js')
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

gulp.task('webserver', ['generate_javascript', 'generate_css'], () => {
  gulp.src('public')
    .pipe(server({
      livereload: true,
      open: true
    }));
  gulp.watch('js/**/*.js', ['generate_javascript']);
  gulp.watch('sass/**/*.scss', ['generate_css']);
});
