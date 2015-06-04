# gulp-replace-md5
A gulp plugin to replace static file url with file-md5.

## Usage

```javascript
var gulp = require("gulp"),
    gulpReplaceMd5 = require("gulp-replace-md5");

gulp.task("replaceMd5", function() {

    return gulp.src("../html/**")
        // options is optional
        .pipe(gulpReplaceMd5( options ) )
        .pipe(gulp.dest("./output"));
});
```

Before the html is like this.

```html
<!doctype html>
<head>
<link rel="stylesheet" type="text/css" href="{{../css/hello.css}}" />
</head>
<body>
<script src="{{../js/hello.js}}"></script>
</body>
</html>
```

After replacement, the html is like this.

```html
<!doctype html>
<head>
<link rel="stylesheet" type="text/css" href="../css/hello_7df0asdf3.css" />
</head>
<body>
<script src="../js/hello_8df7asdf9.js"></script>
</body>
</html>
```

## gulpReplaceMd5([options])

* `options` {Object}

### Options

* `openTag` default `{{`.
* `closeTag` default `}}`. Only those surrounded with `openTag` and `closeTag` will be replaced.

```html
<!doctype html>
<head>
    <title></title>
    <link href="{{../css/hello.css}}" type="text/css" rel="stylesheet"/>
</head>
<body>
<script src="{{../js/hello.js}}" ></script>
<!-- this js won't be replaced -->
<script src="../js/world.js" ></script>
</body>
</html>
```

* `hashFunction` You can define the hashFunction yourself. Currently, the `hashFunction` is listed below.
you can redefined it according to your demands.

```javascript
// transfer the {{../js/hello.js}} to ../js/hello_md5.js
function(filename) {
     return function(content) {
            return filename.split('.').map(function(item, i, arr) {
                // calcMd5 is a self-defined md5 function
                return i == arr.length - 2 ? item + '_' + calcMd5(content) : item;
            }).join('.');
     }
}
```

* `staticHash` Optional. Sometimes, you want to designate some url's corresponding urls. Use this.

```javascript
    {
        "../js/a.js": "../js/a_md5ed.js",
        "../js/b.js": "../js/b_md5ed.js",
        "../css/a.css": "../css/a_md5ed.css",
        "../css/b.css": "../css/b_md5ed.css"
    }
```

## staticArray

* `staticArray` This is the static file path array. The format is [glob](https://github.com/isaacs/node-glob) format.
