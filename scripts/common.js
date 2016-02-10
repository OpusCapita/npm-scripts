var cp = require('child_process');
var gutil = require('gulp-util');
var semver = require('semver');
var git = require('git-rev-sync');

/**
 * Execute command
 *
 * @param cmd - command name
 * @param done - async callback
 */
function command(cmd, done) {
  gutil.log('Executing command:', gutil.colors.magenta(cmd));
  cp.exec(cmd, function (err, stdout, stderr) {
    check(cmd, err, stdout, stderr);
    if (done) {
      done(err, stdout, stderr);
    }
  });
}

/**
 * Builds maven artefact name.
 */
function getMavenArtefactName(artefactId, version) {
  return artefactId + '-' + version + '.zip';
}

/**
 * Builds Grails 3 maven artefact name.
 */
function getGrails3MavenArtefactName(artefactId, version) {
  return artefactId + '-' + version + '.jst';
}

/**
 * Builds maven artefact version based on version from package.json and git branch.
 */
function getMavenArtefactVersion(version, release) {
  var branch = git.branch();
  release = typeof release !== 'undefined' ? release : false;

  gutil.log('The current branch name:', gutil.colors.magenta(branch));
  //if (branch.indexOf('master') !== -1) {
    if (release) {
      var patch = semver.patch(version);
      return semver.major(version) + '.' + semver.minor(version) + '.GA' + (patch !== 0 ? '.' + patch : '');
    }
    return semver.major(version) + '.' + semver.minor(version) + '-SNAPSHOT';
  //}
  //throw new gutil.PluginError('getMavenArtefactVersion', 'Not implemented for bugfix branch yet!');
}

/**
 * Check errors
 *
 * @param cmd - executed command
 * @param err - error object
 * @param stdout - standard output stream
 * @param stderr - standard error output stream
 */
function check(cmd, err, stdout, stderr) {
  if (err) {
    if (err.code === 'ENOENT') {
      console.error(cmd + ' command not found. Do you have it in your PATH?');
    } else {
      console.error(stdout);
      console.error(stderr);
    }
    process.exit(1);
  }
}

module.exports = {
  command: command,
  getMavenArtefactName: getMavenArtefactName,
  getGrails3MavenArtefactName: getGrails3MavenArtefactName,
  getMavenArtefactVersion: getMavenArtefactVersion
};
