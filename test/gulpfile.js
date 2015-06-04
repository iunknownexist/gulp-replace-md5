var replaceMd5 = require('../index'),
    gulp = require('gulp');

gulp.task('test', function() {

    // test1
    gulp.src('./src/html/**')
        .pipe(replaceMd5({ base: __dirname + '/src/' }))
        .pipe(gulp.dest('./output1'));

    // test2
    gulp.src('./src/html/**')
        .pipe(replaceMd5({
            staticHash: {
                "/js/hello.js": "../js/hello_87sdf9df.js",
                "/css/hello.css": "../css/hello_87sdf9df.css"
            }
        }))
        .pipe(gulp.dest('./output2'));
});