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

module.exports = function(options) {

    var defaults = {
            openTag: '{{',
            closeTag: '}}',
            base: '',
            hashFunction: function(filename) {
                return function(content) {
                    return filename.split('.').map(function(item, i, arr) {
                        return i == arr.length - 2 ? item + '_' + calcMd5(content) : item;
                    }).join('.');
                }
            },
            staticHash: null
        },
        fileContents = '';

    options = extend(defaults, options || {});

    if(!options.base && !options.staticHash) {

        throw new gutil.PluginError('gulp-replace-md5', 'base or staticHash at least one must be set');
        return;
    }

    return through.obj(function(file, encoding, cb) {

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-debug', 'Streaming not supported'));
            return cb();
        }

        if(!file.contents){
            return cb();
        }

        var filePath = file.path,
            // 要被replace的原文件所在的文件夹
            fileDir = path.dirname(filePath);

        fileContents = file.contents.toString('utf-8');

        // 如果staticHash没有设置，则通过正则匹配html中的内容来生成一个staticHash
        if(!options.staticHash) {

            options.staticHash = {};
        }

        var staticRegexp = new RegExp(options.openTag + '\\s*?' + '(.*?)' + '\\s*?' + options.closeTag, 'g'),
        // get /a/js/a.js from {{/a/js/a.js}}
            matches = [];

        fileContents.replace(staticRegexp, function ($1, $2) {
            matches.push($2);
        });


        matches.forEach(function (staticUrl) {

            // 如果没有记录在staticHash里面
            if (!options.staticHash[staticUrl]) {

                if (path.isAbsolute(staticUrl)) {
                    try {
                        var staticString = fs.readFileSync(options.base + staticUrl, 'utf-8'),
                            staticUrlBaseFileName = path.basename(staticUrl),
                            staticUrlBaseDirName = path.dirname(staticUrl);

                        // /a/b/c.js -> /base/a/b/c_1212312.js
                        options.staticHash[staticUrl] = path.normalize(options.base + '/' + staticUrlBaseDirName + '/' + options.hashFunction(staticUrlBaseFileName)(staticString));

                    } catch (e) {
                        console.error(e);
                    }
                } else {

                    try {

                        var relativeStaticUrl = path.resolve(fileDir, staticUrl),
                            staticString = fs.readFileSync(relativeStaticUrl, 'utf-8'),
                            staticUrlBaseFileName = path.basename(staticUrl),
                            staticUrlBaseDirName = path.dirname(staticUrl);

                        options.staticHash[staticUrl] = staticUrlBaseDirName + '/' + options.hashFunction(staticUrlBaseFileName)(staticString);

                    } catch (e) {
                        console.error(e);
                    }
                }
            }

        });

        // 如果已经定义好了staticHash, 则忽略掉staticArray
        if(options.staticHash) {

            for(var i in options.staticHash) {
                var staticRegexp = new RegExp(options.openTag + '\\s*?' + i + '\\s*?' + options.closeTag, 'g');
                // replace {{/a/b/c.js}} -> /base/a/b/c_dfadf.js
                fileContents = fileContents.replace(staticRegexp, options.staticHash[i]);
            }

            file.contents = new Buffer(fileContents);

            this.push(file);
            cb();

            // 如果没有定义好staticHash, 暂时抛错
        } else {

            this.emit('error', new gutil.PluginError('gulp-debug', 'staticHash must be set'));
            return cb();
        }
    });
};


function calcMd5(file){
    var md5 = crypto.createHash('md5');
    md5.update(file, 'utf8');

    return  md5.digest('hex').slice(0, 8);
}
