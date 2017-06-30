#!/usr/bin/env node

var program = require('commander');
var path = require('path');
var fs = require('fs');
var lodash = require('lodash');
var execSync = require("child_process").execSync;

var changelogFileName = 'CHANGELOG.md';

program
  .version(require('../package.json').version)
  .option('--all', 'regenerate ' + changelogFileName)
  .description('Update ' + changelogFileName);

program.on('--help', function () {
  console.log(' for examples:');
  console.log('');
  console.log('   update-changelog');
  console.log('   update-changelog --all');
  console.log('');
});

program.parse(process.argv);


var changesMessage = 'Updated ' + changelogFileName;
var updatingVersionMessage = 'Updating to a version to ';
var currentPath = process.cwd();
var packageFilename = path.join(currentPath, 'package.json');
var version = require(packageFilename).version;
var tagName = 'v' + version;

function parseLog(results) {
  // parse git log
  function metadata(log, value) {
    var lines = value.split('\n');
    log.commit = lines[0].split(' ')[1];
    log.author = lines[1].split(':')[1].trim();
    log.date = lines[2].slice(8);
    return log
  }

  var arr = results.split('\n\n').filter(Boolean);
  var len = arr.length;
  var i = 0;

  var data = [];
  var log = {};

  while (i < len) {
    var value = arr[i++];

    if (value.charAt(0) !== ' ') {
      log = metadata(log, value);
      data.push(log)
    } else {
      log.message = value.trim().replace(/\s#\s/g, ' > ');
      log = {}
    }
  }

  return data
}

function getReleaseHeader(tagFrom, tagTo) {
  var compareUrl = '';
  var header = '## [' + tagTo + ']';

  if (originUrl.indexOf('github.com:') !== -1) {
    // generate github compare url
    compareUrl = 'https://github.com/' + originUrl.split('github.com:')[1].split('.git')[0];
    compareUrl = compareUrl + '/compare/' + tagFrom + '...' + tagTo;
  }

  if (compareUrl) {
    header += '(' + compareUrl + ') ';
  }

  if (tags.indexOf(tagTo) !== -1) {
    var tagDate = execSync('git log -1 --format=%ai ' + tagTo).toString();
    header += '(' + new Date(tagDate).toGMTString() + ')\n';
  } else {
    header += '(' + new Date().toGMTString() + ')\n';
  }

  return header;
}

function getReleaseBody(tagFrom, tagTo) {
  var body = '';
  var logQuery = 'git log ';

  if (tagFrom) {
    logQuery += tagFrom + '..';
  }
  logQuery += tagTo ? tagTo : 'HEAD';

  var logs = parseLog(execSync(logQuery).toString());

  if (logs.length > 0) {
    lodash.forEach(logs, function (item) {
      //skip updated message from report
      if (item.message !== changesMessage
        && item.message !== changesMessage.replace(changelogFileName, 'CHANGES.txt') // old format of changelog
        && item.message.indexOf(updatingVersionMessage) === -1) {
        body += ' - ' + item.message + ' (' + item.author + ', ' + item.commit.substr(0, 7) + ')\n';
      }
    });
  }
  return body;
}

var buff = '';
var changesFileBuff = '';
var originUrl = execSync('git config --get remote.origin.url').toString();
var tags = execSync('git tag').toString().split('\n');
tags.pop(); // remove last empty
require('semver-sort').asc(tags); // Sort tags by semver
var changesPath = path.join(currentPath, changelogFileName);
var tagNamePrev = null;

//generate release notes and flush to CHANGELOG.md
if (fs.existsSync(changesPath) && !program.all) {
  changesFileBuff = fs.readFileSync(changesPath, {endoding: 'utf-8'});
  if (changesFileBuff.indexOf('## [' + tagName + ']') === -1) {
    // edit CHANGELOG.md
    //console.log(changesFileBuff.indexOf('## [' + tagName + ']'));
    tagNamePrev = tags.length > 0 ? tags[tags.length - 1] : null; // previous tag
    buff += getReleaseHeader(tagNamePrev, tagName);
    buff += getReleaseBody(tagNamePrev) + '\n';
    console.log('Add changes to ' + changelogFileName + ' ...');
  } else {
    console.log('Changes were added to ' + changelogFileName + ' earlier. Nothing to add now.');
  }
} else {
  // create new CHANGELOG.md file
  tagNamePrev = tags.length > 0 ? tags[tags.length - 1] : null; // previous tag
  buff += getReleaseHeader(tagNamePrev, tagName);
  buff += getReleaseBody(tagNamePrev) + '\n';

  for (var i = tags.length - 2; i >= -1; i--) {
    buff += getReleaseHeader(tags[i], tags[i + 1]);
    buff += getReleaseBody(tags[i], tags[i + 1]) + '\n';
  }

  console.log('Create ' + changelogFileName + ' ...');
}

if (buff) {
  // have some changes => save and commit
  var fd = fs.openSync(changesPath, 'w+');
  buff += changesFileBuff;

  fs.writeSync(fd, buff, 0, buff.length);
  fs.closeSync(fd);

  execSync('git add ' + changelogFileName);
  execSync(`git commit -m "${changesMessage}"`);

  console.log(changelogFileName + ' is updated and committed.');
}