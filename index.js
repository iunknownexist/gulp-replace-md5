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

module.exports = function(options, staticArray) {

    var defaults = {
            marker: '{{static-replacer}}',
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

    // 如果options不是object
    if(Object.prototype.toString.call(options) !== "[object Object]") {
        staticArray = options || [];
        options = {};
    }

    options = extend(defaults, options || {});

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

        // 如果staticHash没有设置，则使用staticArray中的内容来生成一个staticHash
        if(!options.staticHash) {

            options.staticHash = {};

            if(!staticArray) {
                this.emit('error', new gutil.PluginError('gulp-debug', 'second parameter must be set.'));
                return cb();
            }

            if(typeof staticArray === 'string') {
                staticArray = [staticArray];
            }

            // 使用staticArray来生成staticHash
            staticArray.forEach(function(staticUrl) {
                var staticFilenames = [];
                staticUrl &&  (staticFilenames = glob.sync(staticUrl, { nodir: true }));

                staticFilenames.forEach(function(staticFilename) {
                    // 对 filename进行处理
                    // 读取文件，算md5值
                    var content = fs.readFileSync(staticFilename, 'utf-8'),
                        staticBaseFileName = path.basename(staticFilename),
                        staticDirName = path.dirname(staticFilename),
                        relativePath = path.relative(fileDir, staticFilename),
                        hashFunction = options.hashFunction(staticBaseFileName);


                    /**
                     * options.staticHash = { "../js/a.js{{static-replacer}}": "../js/a_md5.js"}
                     */
                    options.staticHash[relativePath + options.marker] = relativePath + '/' + hashFunction(content);

                });

            });
        }


        // 如果已经定义好了staticHash, 则忽略掉staticArray
        if(options.staticHash) {

            console.log(options.staticHash);
            for(var i in options.staticHash) {
                var staticRegexp = new RegExp(i, 'g');
                // replace ../js/a.js{{options.marker}} -> ../js/a_md5.js
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
