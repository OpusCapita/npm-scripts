#!/usr/bin/env node

var pluginInstall = require('./plugin-install');

pluginInstall({
  groupId: 'com.jcatalog.grailsplugins3',
  fileName: 'grails3-plugin.jar',
  packaging: 'jar'
});
