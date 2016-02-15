'use strict';

var util = require('./common');
var through = require('through2');
var gutil = require('gulp-util');
var zip = require('gulp-zip');
var File = gutil.File;
var fs = require('fs');

function createFile(path, text) {
  var buffer = new Buffer(text, 'utf8');
  return new File({
    path: path,
    contents: buffer
  });
}

function addFiles(files) {
  return through.obj(function (file, enc, cb) {
    this.push(file);
    cb();
  }, function (cb) {
    for (var i = 0; i < files.length; i++) {
      this.push(files[i]);
    }
    cb();
  });
}

/**
 * Exports gulp task for package of assets to Grails 3 plugin.
 *
 * @param gulp - A gulp instance
 * @param config - The script configuration
 */
module.exports = function (gulp, config) {
  if (!config.grails || !config.maven) {
    throw new gutil.PluginError('grails3-plugin-package', 'Grails and Maven sections not found in package.json!');
  }

  gulp.task('grails3-plugin-package', function () {
    var release = (process.argv.indexOf("--release") > -1);
    var mavenArtefactVersion = util.getMavenArtefactVersion(config.maven.version, release);

    var pluginFiles = [];
    for (var resId in config.grails.resources) {
      var resource = config.grails.resources[resId];
      for (var i = 0; i < resource.length; i++) {
        var content = fs.readFileSync('./build/' + resource[i].file.name).toString();
        pluginFiles.push(
          createFile('META-INF/assets/' + resource[i].file.name, content)
        )
      }
    }

    return gulp.src([])
      .pipe(addFiles(pluginFiles))
      .pipe(zip(util.getGrails3MavenArtefactName(config.maven.artefactId, mavenArtefactVersion)))
      .pipe(gulp.dest('./build'))
  });
};
