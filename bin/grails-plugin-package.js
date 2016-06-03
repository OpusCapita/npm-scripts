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
var name = project.name;

if (!program.release) {
  version += '-SNAPSHOT';

  console.log('package snapshot grails plugin')
} else {
  console.log('package release grails plugin')
}

var buildPath = path.join(projectPath, 'build');

handlebars.registerHelper('isArray', lodash.isArray);

handlebars.registerHelper('join', function (resources) {
  return resources.join();
});

var pluginPrefix = lodash.map(name.split('-'), function (item) {
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
    grailsVersion: project.grails.version || '',
    app: {
      name: name,
      version: version
    }
  }), {name: 'application.properties'}
);

//adding plugin information
archive.append(
  handlebars.compile(fs.readFileSync(__dirname + '/../templates/plugin.hbs').toString())({
    pluginName: name,
    pluginPrefix: pluginPrefix,
    author: project.author.name || '',
    email: project.author.email || '',
    title: 'Auto-generated for ' + name,
    description: project.description || '',
    version: version,
    artefactId: name
  }), {name: 'plugin.xml'}
);

//adding plugin descriptor
archive.append(
  handlebars.compile(fs.readFileSync(__dirname + '/../templates/descriptor.hbs').toString())({
    pluginPrefix: pluginPrefix,
    author: project.author.name || '',
    email: project.author.email || '',
    title: 'Auto-generated for ' + name,
    description: project.description || '',
    version: version,
    groupId: 'com.jcatalog.grailsplugins'
  }), {name: pluginPrefix + 'GrailsPlugin.groovy'}
);

//adding resources
archive.append(
  handlebars.compile(fs.readFileSync(__dirname + '/../templates/modules.hbs').toString())({
    resources: project.grails.resources,
    pluginName: name
  }), {name: 'grails-app/conf/' + pluginPrefix + 'Resources.groovy'}
);

for (var resId in project.grails.resources) {
  var resource = project.grails.resources[resId];

  if (lodash.isArray(resource)) {
    lodash.forEach(resource,
      function (resource) {
        archive.append(fs.readFileSync('./build/' + resource.file.name).toString(), {name: 'web-app/js/' + resource.file.name});
      }
    );
  } else {
    lodash.forEach(resource.files,
      function (file) {
        archive.append(fs.readFileSync('./build/' + file).toString(), {name: 'web-app/js/' + file});
      }
    );
  }
}
//adding standalone files
for (var standaloneId in project.grails.standaloneFiles) {
  var stanalone = project.grails.standaloneFiles[standaloneId];
  if (lodash.isArray(stanalone)) {
    lodash.forEach(stanalone,
      function (item) {
        archive.append(fs.readFileSync('./build/' + item.file.name).toString(), {name: 'web-app/' + item.file.name});
      }
    );
  } else {
    lodash.forEach(stanalone,
      function (file) {
        archive.append(fs.readFileSync('./build/' + file).toString(), {name: 'web-app/' + file});
      }
    );
  }
}
//adding javascript resources
lodash.forEach(
  globule.find(project.grails.javaSrc + '/**/*.js'),
  function (file) {
    archive.append(fs.createReadStream(file), {name: path.join('src', 'java', path.relative(project.grails.javaSrc, file))})
  }
);

archive.finalize();