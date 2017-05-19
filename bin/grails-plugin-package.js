#!/usr/bin/env node

var program = require('commander');
var path = require('path');
var handlebars = require('handlebars');
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
var version = project.version;
var name = project.name.replace(/@\w+\//, '');
var artefactId = project.grails.artefactId || name;
var groupId = project.grails.groupId || 'com.opuscapita.grailsplugins';

if (!program.release) {
  version += '-SNAPSHOT';

  console.log('package snapshot grails plugin')
} else {
  console.log('package release grails plugin')
}

var buildDir = project.grails.buildDir || 'build';
var buildPath = path.join(projectPath, buildDir);

handlebars.registerHelper('isArray', lodash.isArray);

handlebars.registerHelper('join', function (resources) {
  return resources.join();
});

var pluginPrefix = lodash.map(artefactId.split('-'), function (item) {
  return lodash.capitalize(item);
}).join('');

//create zip archive
var archiver = require('archiver');
var output = fs.createWriteStream(path.join(buildPath, 'grails-plugin.zip'));
var archive = archiver('zip');
output.on('close', function () {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});
archive.on('error', function (err) {
  throw err;
});
archive.pipe(output);

//adding application.properties
archive.append(
  handlebars.compile(fs.readFileSync(__dirname + '/../templates/application.hbs').toString())({
    grailsVersion: project.grails.version || '2.4.4',
    app: {
      name: artefactId,
      version: version
    }
  }), {name: 'application.properties'}
);

//adding plugin information
archive.append(
  handlebars.compile(fs.readFileSync(__dirname + '/../templates/plugin.hbs').toString())({
    pluginName: artefactId,
    pluginPrefix: pluginPrefix,
    author: (project.author && project.author.name) || '',
    email: (project.author && project.author.email) || '',
    title: 'Auto-generated for ' + name,
    description: project.description || '',
    repositoryUrl: (project.repository && project.repository.url) || '',
    version: version,
    artefactId: artefactId
  }), {name: 'plugin.xml'}
);

//adding plugin descriptor
archive.append(
  handlebars.compile(fs.readFileSync(__dirname + '/../templates/descriptor.hbs').toString())({
    pluginPrefix: pluginPrefix,
    author: (project.author && project.author.name) || '',
    email: (project.author && project.author.email) || '',
    title: 'Auto-generated for ' + name,
    description: project.description || '',
    repositoryUrl: (project.repository && project.repository.url) || '',
    version: version,
    groupId: groupId
  }), {name: pluginPrefix + 'GrailsPlugin.groovy'}
);

//adding resources
var resources = {};
for (var resId in project.grails.resources) {
  var resource = project.grails.resources[resId];

  var res = { dependsOn: resource.dependsOn, files: [] };

  if (resource && resource.files) {
    for (var filepath in resource.files) {
      var target = resource.files[filepath];
      res.files.push(target);

      archive.append(fs.readFileSync(path.join(buildDir, filepath)).toString(), {name: path.join('web-app', target)});
    }
  }

  resources[resId] = res;
}
archive.append(
  handlebars.compile(fs.readFileSync(__dirname + '/../templates/modules.hbs').toString())({
    resources: resources,
    pluginName: artefactId
  }), {name: 'grails-app/conf/' + pluginPrefix + 'Resources.groovy'}
);


//adding standalone files
for (var standaloneId in project.grails.standaloneFiles) {
  var stanalone = project.grails.standaloneFiles[standaloneId];

  if (fs.lstatSync(path.join(buildDir, standaloneId)).isDirectory()) {
    // append files from a directory if it's directory
    archive.directory(path.join(buildDir, standaloneId), stanalone);
  } else {
    archive.append(fs.readFileSync(path.join(buildDir, standaloneId)).toString(), {name: stanalone});
  }
}

archive.finalize();
