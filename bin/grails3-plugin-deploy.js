#!/usr/bin/env node

var pluginDeploy = require('./plugin-deploy');

pluginDeploy({
  groupId: 'com.opuscapita.grailsplugins3',
  fileName: 'grails3-plugin.jar',
  packaging: 'jar'
});
