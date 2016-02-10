'use strict';

var util = require('./common');
var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');

module.exports = function (gulp, config) {

  // checks configuration
  if (!config.maven) {
    throw new gutil.PluginError('plugin-install', 'Maven section not found in package.json!');
  }

  if (config.maven.groupId === undefined) {
    throw new gutil.PluginError('mvn-install', 'Undefined maven [groupId] in configuration')
  }

  if (config.maven.artefactId === undefined) {
    throw new gutil.PluginError('mvn-install', 'Undefined maven [artefactId] in configuration')
  }

  /**
   * The task installing grails plugin to local repository.
   */
  gulp.task('grails3-plugin-install', function () {
    var install = function (groupId, artefactId, version) {
      var stream = this;
      var packaging = config.maven.packaging !== undefined ? config.maven.packaging : 'jar';
      return through.obj(function (file, enc, cb) {
        util.command('mvn -B install:install-file -Dfile=' + file.path + ' -DgroupId=' + groupId + ' -DartifactId=' + artefactId + ' -Dversion=' + version + ' -Dpackaging=' + packaging, function (err, stdout, stderr) {
          if (err) {
            stream.emit('error', new gutil.PluginError('mvn-install', err));
          } else {
            cb();
          }
        });
      });
    };

    var version = util.getMavenArtefactVersion(config.version);
    var filepath = path.join('./build', util.getGrails3MavenArtefactName(config.maven.artefactId, version));

    gulp.src(filepath)
      .pipe(install(config.maven.groupId.replace('grailsplugins', 'grails3plugins'), config.maven.artefactId, version));
  });
};
