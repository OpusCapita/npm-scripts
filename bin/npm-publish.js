#!/usr/bin/env node

var program = require('commander');
var fluidPublish = require('fluid-publish');

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

if (program.release) {
  fluidPublish.standard(program.test, {
    "pushVCTagCmd": "git push origin v${version}",
    // "changesCmd": "printf ''"
  });
} else {
  fluidPublish.dev(program.test, {
    "devVersion": "${version}.${timestamp}",
    "devTag": "SNAPSHOT",
    "publishCmd": "npm publish -f",
    // "changesCmd": "printf ''"
  });
}