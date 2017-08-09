#!/usr/bin/env node

var program = require('commander');
var fluidPublish = require('fluid-publish');
var path = require('path');
var fs = require('fs');
var execSync = require("child_process").execSync;


function isTag(tag) {
  const tagList = execSync('git tag').toString().split('\n');

  for (let i = 0; i < tagList.length; i++) {
    if (tagList[i] === tag) {
      return true;
    }
  }

  return false;
}

function isNpmVersion(packageName, version) {
  const npmVersion = execSync(`npm view ${packageName} version`).toString();
  return npmVersion.trim() === version.trim();
}

function cleanErrorPublish({ packageName, hasTag, hasVersion, tag, version}) {
  if (hasTag) { // Delete tag from GitHub
    execSync(`git tag -d ${tag}`);
    execSync(`git push origin :refs/tags/${tag}`);
  }

  if (hasVersion) { // Delete version from npm
    execSync(`npm unpublish ${packageName}@${version}`);
  }
}

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
  const date = new Date().toISOString();
  //remove {':', '-'} symbols from format because npm publish doesn't work
  return date.split(':').join('').split('-').join('');
};

if (program.release) {
  var updatingVersionMessage = 'Updating to a version to ';
  var currentPath = process.cwd();
  var packageFilename = path.join(currentPath, 'package.json');
  var currentPackage = require(packageFilename);
  var version = currentPackage.version;
  var tag = `v${version}`;
  var packageName = currentPackage.name;
  var isSuccessful = true;

  try {
    fluidPublish.standard(program.test, {
      "pushVCTagCmd": "git push origin v${version}",
      "vcTagCmd": "git tag -a v${version} -m \"Tagging the ${version} release\""
    });
  } catch (e) {
    isSuccessful = false;

    if (!program.test) {
      const hasTag = isTag(tag);
      const hasVersion = isNpmVersion(packageName, version);
      cleanErrorPublish({ packageName, hasTag, hasVersion, tag, version});

      process.exit(1);
    }
  }

  if (!program.test && isSuccessful) {
    execSync(`node ${path.resolve(__dirname, './update-changelog.js')}`, { stdio: 'inherit' });
    execSync('git push');

    let vNumbers = version.split(".");
    let lastNumber = parseInt(vNumbers[vNumbers.length - 1], 10);
    vNumbers[vNumbers.length - 1] = lastNumber + 1;
    let targetVersion = vNumbers.join('.');

    let VERSION_REGEXP = new RegExp(
      '([\'|\"]?version[\'|\"]?[ ]*:[ ]*[\'|\"]?)[\\d||A-a|.|-]*([\'|\"]?)', 'gi');

    let packageData = fs.readFileSync(packageFilename).toString();
    packageData = packageData.replace(VERSION_REGEXP, "\"version\": \"" + targetVersion + "\"");
    fs.writeFileSync(packageFilename, packageData);

    execSync('git add package.json');
    execSync(`git commit -m "${updatingVersionMessage} ${targetVersion}"`);
    execSync('git push');
  }
} else {
  fluidPublish.dev(program.test, {
    "devVersion": "${version}-${preRelease}.${timestamp}",
    "devTag": "SNAPSHOT",
    "publishCmd": "npm publish -f"
    // "changesCmd": "printf ''"
  });
}
