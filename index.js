/**
 * Created by patrickliu on 15/5/27.
 */

var through = require('through2')
    , gutil = require('gulp-util')
    , crypto = require('crypto')
    , extend = require('node.extend')
    , fs = require('fs')
    , path = require('path')
    , glob = require('glob');

module.exports = function (options) {

    var defaults = {
            openTag: '{{',
            closeTag: '}}',
            base: '',
            hashFunction: function (filename) {
                return function (content) {
                    return filename.split('.').map(function (item, i, arr) {
                        return i == arr.length - 2 ? item + '_' + calcMd5(content) : item;
                    }).join('.');
                }
            },
            staticHash: {}
        },
        fileContents = '';

    options = extend(defaults, options || {});

    return through.obj(function (file, encoding, cb) {

        var _that = this;

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-debug', 'Streaming not supported'));
            return cb();
        }

        if (!file.contents) {
            return cb();
        }

        var filePath = file.path,
            fileDir = path.dirname(filePath);

        fileContents = file.contents.toString('utf-8');

        var staticRegexp = new RegExp(options.openTag + '\\s*?' + '(.*?)' + '\\s*?' + options.closeTag, 'g'),
        // get /a/js/a.js from {{/a/js/a.js}}
            matches = [];

        // get all the matched js or css url from the fileContents
        fileContents.replace(staticRegexp, function ($1, $2) {
            matches.push($2);
        });

        // traverse the matches to read the static files
        // and store it in the staticHash object
        matches.forEach(function (staticUrl) {

            // if not in the staticHash
            if (!options.staticHash[staticUrl]) {

                try {
                    // and is the absolute url
                    if (path.isAbsolute(staticUrl)) {

                        // in fact, if you want to set the absolute url of the static files
                        // you should set a base in the options
                        var staticString = fs.readFileSync(options.base + staticUrl, 'utf-8'),
                            staticUrlBaseFileName = path.basename(staticUrl),
                            staticUrlBaseDirName = path.dirname(staticUrl);

                        // /a/b/c.js -> /a/b/c_1212312.js
                        // store {'/a/b/c.js': '/a/b/c_1212312.js} in staticHash
                        options.staticHash[staticUrl] = staticUrlBaseDirName + '/' + options.hashFunction(staticUrlBaseFileName)(staticString);

                    } else {

                        // if is relative url
                        // calculate the file path with the fileDir and staticUrl
                        var relativeStaticUrl = path.resolve(fileDir, staticUrl),
                            staticString = fs.readFileSync(relativeStaticUrl, 'utf-8'),
                            staticUrlBaseFileName = path.basename(staticUrl),
                            staticUrlBaseDirName = path.dirname(staticUrl);

                        // and set the key/value in the staticUrl
                        options.staticHash[staticUrl] = staticUrlBaseDirName + '/' + options.hashFunction(staticUrlBaseFileName)(staticString);

                    }
                } catch (e) {

                    console.error('[gulp-replace-md5] generate staticHash error! ' + e.message);
                }
            }

        });


        // replace the url with url_md5
        matches.forEach(function(staticUrl) {

            var staticRegexp = new RegExp(options.openTag + '\\s*?' + staticUrl + '\\s*?' + options.closeTag, 'g');
            // replace {{/a/b/c.js}} -> /base/a/b/c_dfadf.js
            fileContents = fileContents.replace(staticRegexp, options.staticHash[staticUrl]);

        });

        file.contents = new Buffer(fileContents);

        this.push(file);
        cb();

    });
};


function calcMd5(file) {
    var md5 = crypto.createHash('md5');
    md5.update(file, 'utf8');

    return md5.digest('hex').slice(0, 8);
}
