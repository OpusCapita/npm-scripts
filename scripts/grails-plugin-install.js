'use strict';

var util = require('./common');
var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');

/**
 * Exports task in order to install Grails 2 artefact to local repository.
 *
 * @param gulp - A gulp instance
 * @param config - The script configuration
 */
module.exports = function (gulp, config) {
  // checks configuration
  if (!config.maven) {
    throw new gutil.PluginError('grails-plugin-install', 'Maven section not found in package.json!');
  }

  if (config.maven.groupId === undefined) {
    throw new gutil.PluginError('grails-plugin-install', 'Undefined maven [groupId] in configuration')
  }

  if (config.maven.artefactId === undefined) {
    throw new gutil.PluginError('grails-plugin-install', 'Undefined maven [artefactId] in configuration')
  }

  /**
   * The task installing grails plugin to local repository.
   */
  gulp.task('grails-plugin-install', function () {
    var install = function (groupId, artefactId, version) {
      var stream = this;
      var packaging = config.maven.packaging !== undefined ? config.maven.packaging : 'zip';
      return through.obj(function (file, enc, cb) {
        util.command('mvn -B install:install-file -Dfile=' + file.path + ' -DgroupId=' + groupId + ' -DartifactId=' + artefactId + ' -Dversion=' + version + ' -Dpackaging=' + packaging, function (err, stdout, stderr) {
          if (err) {
            stream.emit('error', new gutil.PluginError('grails-plugin-install', err));
          } else {
            cb();
          }
        });
      });
    };

    var version = util.getMavenArtefactVersion(config.maven.version);
    var filepath = path.join('./build', util.getMavenArtefactName(config.maven.artefactId, version));

    gulp.src(filepath)
      .pipe(install(config.maven.groupId, config.maven.artefactId, version));
  });
};
