var gulp = require('gulp');
var server = require('gulp-server-livereload');
 
gulp.task('webserver', function() {
  gulp.src('public')
    .pipe(server({
      livereload: true,
      open: true
    }));
});
