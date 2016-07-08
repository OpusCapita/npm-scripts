#!/usr/bin/env node

var pluginDeploy = require('./plugin-deploy');

pluginDeploy({
  groupId: 'com.jcatalog.grailsplugins',
  fileName: 'grails-plugin.zip',
  packaging: 'zip'
});
