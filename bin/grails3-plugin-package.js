#!/usr/bin/env node

var program = require('commander');
var path = require('path');
var fs = require('fs');
var globule = require('globule');
var lodash = require('lodash');

program
  .version(require('../package.json').version)
  .option('--release', 'should package artefact as release')
  .description('Package grails plugin');

program.on('--help', function () {
  console.log(' for examples:');
  console.log('');
  console.log('   grails-plugin-package');
  console.log('   grails-plugin-deploy --release');
  console.log('');
});

program.parse(process.argv);

var projectPath = process.cwd();

var project = require(path.join(projectPath, 'package.json'));

if (!program.release) {
  console.log('package snapshot grails plugin')
} else {
  console.log('package release grails plugin')
}

var buildDir = project.grails.buildDir || 'build';
var buildPath = path.join(projectPath, buildDir);

//create jar archive
var archiver = require('archiver');
var output = fs.createWriteStream(path.join(buildPath, 'grails3-plugin.jar'));
var archive = archiver('zip');
output.on('close', function () {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});
archive.on('error', function (err) {
  throw err;
});
archive.pipe(output);

//adding resources
var resources = {};
for (var resId in project.grails.resources) {
  var resource = project.grails.resources[resId];

  var res = { dependsOn: resource.dependsOn, files: [] };

  if (resource && resource.files) {
    for (var filepath in resource.files) {
      var target = resource.files[filepath];
      res.files.push(target);

      archive.append(fs.readFileSync(path.join(buildDir, filepath)).toString(), {name: path.join('META-INF/assets/', target)});
    }
  }

  resources[resId] = res;
}

//adding standalone files
for (var standaloneId in project.grails.standaloneFiles) {
  var stanalone = project.grails.standaloneFiles[standaloneId];
  archive.append(fs.readFileSync(path.join(buildDir, standaloneId)).toString(), {name: path.join('META-INF/assets/', stanalone)});
}

archive.finalize();
