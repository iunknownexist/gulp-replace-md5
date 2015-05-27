var replaceMd5 = require('../index'),
    gulp = require('gulp');

gulp.task('test', function() {

    gulp.src('./src/html/**')
        .pipe(replaceMd5({ marker: '{{static-replacer}}'}, ['./src/js/**', './src/css/**']))
        .pipe(gulp.dest('./output'));
});