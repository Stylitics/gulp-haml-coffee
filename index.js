var map = require('map-stream');
var rext = require('replace-ext');
var hamlc = require('haml-coffee');
var gutil = require('gulp-util');
var path  = require('path');
var _     = require('underscore')

module.exports = function(options) {
  if(!options) options = {};

  // Map each file to this function
  function hamlStream(file, cb) {
    if (file.isNull()) return cb(null, file); // pass along
    if (file.isStream()) return cb(new Error("gulp-haml-coffee: Streaming not supported"));

    // gulp-haml-coffee compiles to plain HTML per default. If the `js` option is set,
    // it will compile to a JS function.
    var output;
    try {
      if (options.js) {
        options.name = buildTemplateName(file.path, options.pathRelativeTo);

        output = hamlc.template(file.contents.toString("utf8"), options.name, options.namespace, options);
        file.path = rext(file.path, ".js");
      } else {
        output = hamlc.render(file.contents.toString("utf8"), options.locals || {}, options);
        file.path = rext(file.path, ".html");
      }
    } catch (e) {
      throw new gutil.PluginError('gulp-haml-coffee',
        'Error compiling ' + file.path + ': ' + e, {
        showStack: true
      });
    }

    file.contents = new Buffer(output);

    cb(null, file);
  }

  function buildTemplateName(filename, pathRelativeTo) {
    var defaultPath = '';

    defaultPath = path.relative(pathRelativeTo, path.dirname(filename));

    if (defaultPath !== '') {
      defaultPath += '/';
    }

    return defaultPath + path.basename(filename, path.extname(filename));
  }

  // Return a stream
  return map(hamlStream);
};
