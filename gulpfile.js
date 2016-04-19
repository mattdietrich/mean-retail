var gulp = require('gulp');
var browserify = require('gulp-browserify');
var mocha = require('gulp-mocha');

// gulp.task('browserify', function() {
//   	return gulp.
//     	src('./server.js').
//     	pipe(browserify()).
//     	pipe(gulp.dest('./bin'));
// });

gulp.task('browserify', function() {
    return gulp.
      src('./public/index.js').
      pipe(browserify()).
      pipe(gulp.dest('./public/bin'));
});

gulp.task('watch-browserify', function() {
    gulp.watch(['./public/**/*.js'], ['browserify']);
});

gulp.task('test', function() {
  	gulp.
    	src('./test/api-test.js').
    	pipe(mocha()).
    	on('error', function(err) {
      		this.emit('end');
    	});
});

gulp.task('watch', function() {
    gulp.watch(['./**/*.js'], ['test']);
});
