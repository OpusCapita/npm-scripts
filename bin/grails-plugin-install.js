#!/usr/bin/env node

var pluginInstall = require('./plugin-install');

pluginInstall({
  groupId: 'com.opuscapita.grailsplugins',
  fileName: 'grails-plugin.zip',
  packaging: 'zip'
});
