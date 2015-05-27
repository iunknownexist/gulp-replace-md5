# gulp-replace-md5
a gulp plugin to replace static file url with file-md5.

## Usage

```javascript
var gulp = require("gulp"),
    gulpReplaceMd5 = require("gulp-replace-md5");

gulp.task("replaceMd5", function() {

    gulp.src("../html/**")
        // options is optional
        .pipe(gulpReplaceMd5( options, ["../js/**", "../css/**", "../img/**"]) )
        .pipe(gulp.dest("./output"));
});

```
## gulpReplaceMd5([options], [staticArray])

* `options` {Object}
* `staticArray` {String | Array}

### Options

* `marker` default `{{static-replacer}}`, you can define it your own. The static resources of the html or others that
need to be replaced should be like below. Only these suffixed with `marker` will be replaced.
```html
<!doctype html>
<head>
    <title></title>
    <link href="../css/hello.css{{static-replacer}}" type="text/css" rel="stylesheet"/>
</head>
<body>
<script src="../js/hello.css{{static-replacer}}" ></script>
</body>
</html>
```
* `hashFunction` You can define the hashFunction yourself. Currently, the `hashFunction` is listed below.
you can redefined it according to your demands.
```javascript
// transfer the ../js/hello.js{{static-replacer}} to ../js/hello_md5.js
function(filename) {
     return function(content) {
            return filename.split('.').map(function(item, i, arr) {
                // calcMd5 is a self-defined md5 function
                return i == arr.length - 2 ? item + '_' + calcMd5(content) : item;
            }).join('.');
     }
}
```

## staticArray

* `staticArray` This is the static file path array. The format is [glob](https://github.com/isaacs/node-glob) format.
