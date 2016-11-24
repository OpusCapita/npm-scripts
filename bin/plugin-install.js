#!/usr/bin/env node

var program = require('commander');
var path = require('path');
var cp = require('child_process');

//config = {
//     groupId
//     packaging
//     fileName
//}
function pluginInstall(config) {

  program
    .version(require('../package.json').version)
    .option('--release', 'should install artefact as release')
    .description('Install grails plugin to maven repository');

  program.on('--help', function () {
    console.log(' for examples:');
    console.log('');
    console.log('   grails-plugin-install');
    console.log('   grails-plugin-install --release');
    console.log('');
  });

  program.parse(process.argv);

  var projectPath = process.cwd();

  var project = require(path.join(projectPath, 'package.json'));
  var version = project.version;
  var name = project.name.replace(/@\w+\//, '');
  var artefactId = project.grails.artefactId || name;
  var groupId = project.grails.groupId || config.groupId;

  if (!program.release) {
    version += '-SNAPSHOT';

    console.log('install snapshot grails plugin to local repository')
  } else {
    console.log('install release grails plugin to local repository')
  }

  var buildDir = project.grails.buildDir || 'build';
  var buildPath = path.join(projectPath, buildDir);
  var filePath = path.join(buildPath, config.fileName);

  var cmdFile = 'mvn';

  if (/^win/.test(process.platform)) {
    cmdFile = 'mvn.cmd';
  }

  var commandName = cmdFile + ' -B install:install-file -Dfile=' + filePath
    + ' -DgroupId=' + groupId + ' -DartifactId=' + artefactId
    + ' -Dversion=' + version + ' -Dpackaging=' + config.packaging;

  console.log(commandName);

  cp.exec(commandName
    , function (err, stdout, stderr) {
      if (err) {
        if (err.code === 'ENOENT') {
          console.error(`${cmdFile} is not found`);
        } else {
          console.error(stdout);
          console.error(stderr);
        }
        process.exit(1);
      }
    });
};

module.exports = pluginInstall;
