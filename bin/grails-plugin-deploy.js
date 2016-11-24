#!/usr/bin/env node

var pluginDeploy = require('./plugin-deploy');

pluginDeploy({
  groupId: 'com.opuscapita.grailsplugins',
  fileName: 'grails-plugin.zip',
  packaging: 'zip'
});
