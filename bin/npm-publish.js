#!/usr/bin/env node

var program = require('commander');
var fluidPublish = require('fluid-publish');
var path = require('path');
var fs = require('fs');
var lodash = require('lodash');
var execSync = require("child_process").execSync;

program
  .version(require('../package.json').version)
  .option('--test', 'specifies that a tarball should be created instead of publishing to NPM')
  .option('--release', 'should publish npm as release')
  .description('Publish npm module');

program.on('--help', function () {
  console.log(' for examples:');
  console.log('');
  console.log('   npm-publish');
  console.log('   npm-publish --release');
  console.log('');
});

program.parse(process.argv);

//override default date format and change timestamp of current revision to now time
fluidPublish.convertToISO8601 = function(timestamp) {
  var date = new Date().toISOString();
  //remove {':', '-'} symbols from format because npm publish doesn't work
  return date.split(':').join('').split('-').join('');
};

if (program.release) {
  function parseLog (results) {
    function metadata (log, value) {
      var lines = value.split('\n')
      log.commit = lines[0].split(' ')[1]
      log.author = lines[1].split(':')[1].trim()
      log.date = lines[2].slice(8)
      return log
    }
    var arr = results.split('\n\n').filter(Boolean)
    var len = arr.length
    var i = 0

    var data = []
    var log = {}

    while (i < len) {
      var value = arr[i++]

      if (value.charAt(0) !== ' ') {
        log = metadata(log, value)
        data.push(log)
      } else {
        log.message = value.trim()
        log = {}
      }
    }

    return data
  }

  if (!program.test) {
    var currentPath = process.cwd();
    var packageFilename = path.join(currentPath, 'package.json');
    var version = require(packageFilename).version;
    //generate release notes and flush to CHANGES.txt
    var buff = '\nRelease ' + version + ' ' + new Date().toString() + '\n';
    buff += '=======================================================\n\n';

    var tags = execSync('git tag').toString().split('\n');
    var tag = tags.length > 1 ? tags[tags.length-2] : null;

    var logs = parseLog(execSync(tag ? 'git log ' + tag + '..HEAD' : 'git log').toString());

    var changesMessage = 'Updated CHANGES.txt';
    var updatingVersionMessage = 'Updating to a version ';

    if (logs.length > 0 && logs[0].message !== changesMessage
      && logs[0].message.indexOf(updatingVersionMessage) === -1) {
      lodash.forEach(logs, function (item) {
        //skip updated message from report
        if (item.message !== changesMessage) {
          buff += ' - ' + item.message + ' (' + item.author + ', ' + item.date + ')\n';
        }
      });

      var changesPath = path.join(currentPath, 'CHANGES.txt');

      if (fs.existsSync(changesPath)) {
        buff += fs.readFileSync(changesPath);
      }

      var fd = fs.openSync(changesPath, 'w+');

      fs.writeSync(fd, buff, 0, buff.length);
      fs.closeSync(fd);

      execSync('git add CHANGES.txt');
      execSync('git commit -m \'' + changesMessage + '\'');
    }

    var vNumbers = version.split(".");
    var lastNumber = parseInt(vNumbers[vNumbers.length - 1], 10);
    vNumbers[vNumbers.length - 1] = lastNumber + 1;
    var targetVersion = vNumbers.join('.');

    var VERSION_REGEXP = new RegExp(
      '([\'|\"]?version[\'|\"]?[ ]*:[ ]*[\'|\"]?)[\\d||A-a|.|-]*([\'|\"]?)', 'gi');

    var packageData = fs.readFileSync(packageFilename).toString();
    packageData = packageData.replace(VERSION_REGEXP, "\"version\": \"" + targetVersion + "\"");
    fs.writeFileSync(packageFilename, packageData);

    execSync('git add package.json');
    execSync('git commit -m \'' + updatingVersionMessage + targetVersion + '\'');
    execSync('git push');
  }


  fluidPublish.standard(program.test, {
    "pushVCTagCmd": "git push origin v${version}",
    // "changesCmd": "printf ''"
  });
} else {
  fluidPublish.dev(program.test, {
    "devVersion": "${version}-${preRelease}.${timestamp}",
    "devTag": "SNAPSHOT",
    "publishCmd": "npm publish -f",
    // "changesCmd": "printf ''"
  });
}