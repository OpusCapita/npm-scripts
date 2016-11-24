#!/usr/bin/env node

var program = require('commander');
var path = require('path');
var fs = require('fs');
var spawnSync = require('child_process').spawnSync;
var xml2js = require('xml2js');
var homedir = require('homedir');
var lodash = require('lodash');

var retrieveRepositoriesInfo = function() {
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
  return repositories;
};

//config = {
//     groupId
//     packaging
//     fileName
//}
function pluginDeploy(config) {

  program
    .version(require('../package.json').version)
    .option('--release', 'should deploy artefact as release')
    .description('Deploys grails plugin to maven repository');

  program.on('--help', function () {
    console.log(' for examples:');
    console.log('');
    console.log('   grails-plugin-deploy');
    console.log('   grails-plugin-deploy --release');
    console.log('');
  });

  program.parse(process.argv);

  var projectPath = process.cwd();

  var repositories = retrieveRepositoriesInfo();

  var project = require(path.join(projectPath, 'package.json'));
  var buildDir = project.grails.buildDir || 'build';
  var filePath = path.join(path.join(projectPath, buildDir), config.fileName);
  var name = project.name.replace(/@\w+\//, '');
  var artefactId = project.grails.artefactId || name;
  var groupId = project.grails.groupId || config.groupId;
  var version = program.release ? project.version : `${project.version}-SNAPSHOT`;

  var targetRepository = program.release ? repositories.releases : repositories.snapshots;

  console.log(`deploying grails plugin ${program.release ? 'release' : 'snapshot'} version ${version}`);

  var cmdFile = 'mvn';

  if (/^win/.test(process.platform)) {
    cmdFile = 'mvn.cmd';
  }

  var result = spawnSync(cmdFile,
    ['-B', '-e', 'deploy:deploy-file', `-Dfile=${filePath}`,
      `-Durl=${targetRepository.url}`, `-DrepositoryId=${targetRepository.id}`,
      '-DgroupId=' + groupId, `-DartifactId=${artefactId}`,
      `-Dversion=${version}`, '-Dpackaging=' + config.packaging]
  );

  if (result.error) {
    if (result.error.code === 'ENOENT') {
      console.error(`${cmdFile}: command is not found`);
    } else {
      console.error(stdout);
      console.error(stderr);
    }
    process.exit(1);
  } else {
    console.log(result.stdout.toString('utf8'));
  }

}


module.exports = pluginDeploy;
