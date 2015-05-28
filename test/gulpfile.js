var replaceMd5 = require('../index'),
    gulp = require('gulp');

gulp.task('test', function() {

    // test1
    // input Options.marker, staticArray
    gulp.src('./src/html/**')
        .pipe(replaceMd5({ marker: '{{static-replacer}}'}, ['./src/js/**', './src/css/**']))
        .pipe(gulp.dest('./output1'));

    // test1
    // input Options.marker and Options.staticHash, without a staticArray
    gulp.src('./src/html/**')
        .pipe(replaceMd5({
            marker: '{{static-replacer}}',
            staticHash: {
                "../js/hello.js": "../js/hello_87sdf9df.js",
                "../css/hello.css": "../css/hello_87sdf9df.css"
            }
        }))
        .pipe(gulp.dest('./output2'));
});