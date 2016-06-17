#!/usr/bin/env node

var program = require('commander');
var path = require('path');
var cp = require('child_process');

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
var name = project.name;

if (!program.release) {
  version += '-SNAPSHOT';

  console.log('install snapshot grails plugin to local repository')
} else {
  console.log('install release grails plugin to local repository')
}

var buildPath = path.join(projectPath, 'build');
var filePath = path.join(buildPath, 'grails-plugin.zip');

var cmdFile = 'mvn';

if (/^win/.test(process.platform)) {
  cmdFile = 'mvn.bat';
}

var commandName = cmdFile + ' -B install:install-file -Dfile=' + filePath
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
  });

