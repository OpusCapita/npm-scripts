#!/usr/bin/env node

var program = require('commander');
var path = require('path');
var fs = require('fs');
var cp = require('child_process');
var xml2js = require('xml2js');
var homedir = require('homedir');
var lodash = require('lodash');

program
  .version(require('../package.json').version)
  .option('--release', 'should deploy artefact as release')
  .description('Deploy grails plugin to maven repository');

program.on('--help', function () {
  console.log(' for examples:');
  console.log('');
  console.log('   grails-plugin-deploy');
  console.log('   grails-plugin-deploy --release');
  console.log('');
});

program.parse(process.argv);

var projectPath = process.cwd();

var project = require(path.join(projectPath, 'package.json'));
var version = project.version;
var name = project.name;

//define default repositories
var repositories = {
  snapshots: {
    id: 'maven2SnapshotsDeploymentRepositoryId',
    url: 'http://maven.scand/nexus/content/repositories/snapshots'
  },
  releases: {
    id: 'maven2ReleasesDeploymentRepositoryId',
    url: 'http://maven.scand/nexus/content/repositories/releases'
  }
};

var m2settingsPath = path.join(homedir(), '.m2', 'settings.xml');

if (fs.existsSync(m2settingsPath)) {
  var parser = new xml2js.Parser();
  var m2settingsXml = fs.readFileSync(m2settingsPath);
  parser.parseString(m2settingsXml, function (err, data) {
    var activeProfile = data.settings.activeProfiles[0].activeProfile[0];

    if (activeProfile) {
      var profile = lodash.find(data.settings.profiles[0].profile, function (item) {
        return item.id[0] === activeProfile;
      });

      if (profile) {
        if (profile.properties) {
          if (profile.properties[0].maven2SnapshotsDeploymentRepositoryId
            && profile.properties[0].maven2SnapshotsDeploymentRepositoryUrl) {
            repositories.snapshots.id = profile.properties[0].maven2SnapshotsDeploymentRepositoryId[0];
            repositories.snapshots.url = profile.properties[0].maven2SnapshotsDeploymentRepositoryUrl[0];
          }

          if (profile.properties[0].maven2ReleasesDeploymentRepositoryId
            && profile.properties[0].maven2ReleasesDeploymentRepositoryUrl) {
            repositories.releases.id = profile.properties[0].maven2ReleasesDeploymentRepositoryId[0];
            repositories.releases.url = profile.properties[0].maven2ReleasesDeploymentRepositoryUrl[0];
          }
        }
      } else {
        console.log('Profile [' + activeProfile + '] was not found in .m2/settings.xml');
      }
    }
  });
}

var repository = repositories.releases;

if (!program.release) {
  version += '-SNAPSHOT';
  repository = repositories.snapshots;

  console.log('deploy snapshot grails plugin');
} else {
  console.log('deploy release grails plugin')
}

var buildPath = path.join(projectPath, 'build');
var filePath = path.join(buildPath, 'grails-plugin.zip');

var commandName = 'mvn -B deploy:deploy-file -Dfile=' + filePath
  + ' -Durl=' + repository.url + ' -DrepositoryId=' + repository.id
  + ' -DgroupId=com.jcatalog.grailsplugins -DartifactId=' + name
  + ' -Dversion=' + version + ' -Dpackaging=zip';

console.log(commandName);

cp.exec(commandName
  , function (err, stdout, stderr) {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error('mvn is not installed');
      } else {
        console.error(stdout);
        console.error(stderr);
      }
      process.exit(1);
    }
  }
);

