'use strict';

var util = require('./common');
var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');

module.exports = function (gulp, config) {

  // checks configuration
  if (!config.maven) {
    throw new gutil.PluginError('plugin-deploy', 'Maven section not found in package.json!');
  }

  if (config.maven.groupId === undefined) {
    throw new gutil.PluginError('mvn-deploy', 'Undefined maven [groupId] in configuration')
  }

  if (config.maven.artefactId === undefined) {
    throw new gutil.PluginError('mvn-deploy', 'Undefined maven [artefactId] in configuration')
  }

  /**
   * The task deploying grails plugin to remote repository
   */
  gulp.task('grails3-plugin-deploy', function () {
    var release = (process.argv.indexOf("--release") > -1);

    var deploy = function (groupId, artefactId, version) {
      var stream = this;
      var releasedVersion = version.indexOf('-SNAPSHOT') == -1;
      var repositoryId = releasedVersion ? config.maven.repositories.releases.id : config.maven.repositories.snapshots.id;
      var repositoryUrl = releasedVersion ? config.maven.repositories.releases.url : config.maven.repositories.snapshots.url;

      if (repositoryUrl === undefined) {
        throw new gutil.PluginError('mvn-deploy', 'Undefined maven repository URL in configuration')
      }
      if (repositoryId === undefined) {
        throw new gutil.PluginError('mvn-deploy', 'Undefined maven repository ID in configuration')
      }

      var packaging = config.maven.packaging !== undefined ? config.maven.packaging : 'jar';
      return through.obj(function (file, enc, cb) {
        util.command('mvn -B deploy:deploy-file -Dfile=' + file.path + ' -Durl=' + repositoryUrl + ' -DrepositoryId=' + repositoryId + ' -DgroupId=' + groupId + ' -DartifactId=' + artefactId
          + ' -Dversion=' + version + ' -Dpackaging=' + packaging, function (err, stdout, stderr) {
          if (err) {
            stream.emit('error', new gutil.PluginError('mvn-deploy', err));
          } else {
            cb();
          }
        });
      });
    };

    var version = util.getMavenArtefactVersion(config.version, release);
    var filepath = path.join('./build', util.getMavenArtefactName(config.maven.artefactId, version));

    gulp.src(filepath)
      .pipe(deploy(config.maven.groupId.replace('grailsplugins', 'grails3plugins'), config.maven.artefactId, version))
  });
};
