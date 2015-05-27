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

* `marker` default `{{static-replacer}}`, you can define it your own. Your html that need to be replaced should like also
change with the `marker`.
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
* `hashFunction` We can define the hashFunction ourselves. Currenly, the `hashFunction` is listed below.
We can redefined it according to our demands.
```javascript
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
