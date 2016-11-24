# Dev Tools
-----------

Package provides the next goals:

npm-publish - build and publish npm module to local repository
arguments:
--test - generate npm package and save as local file
--release - create release, publish the package to local repo and update CHANGES.txt what was changed between releases

grails-plugin-install - package and install grails plugin to local repository
arguments:
--release - install plugin as release

grails-plugin-deploy - package and install grails plugin to remote repository
arguments:
--release - deploy plugin as release

grails-plugin-package - package grails plugin
arguments:
--release - package plugin as release

grails3-plugin-install - package and install grails 3 plugin to local repository
arguments:
--release - install plugin as release

grails3-plugin-deploy - package and install grails 3 plugin to remote repository
arguments:
--release - deploy plugin as release

grails3-plugin-package - package grails 3 plugin
arguments:
--release - package plugin as release

Grails plugin configuration
If you want publish your modules as grails resources, you can add grails section in your package.json

for example:
```
{
  "name": "simple-js",
  "version": "1.0",
  ...

  "grails": {
    "artefactId": "simple-js-resources",
    "groupId":"com.opuscapita.grailsplugins",
    "resources": {
      "external-resources": {
        "dependsOn": ["jquery"],
        "files": {
          "bundles/first.js": "js/bundles/first.js",
          "bundles/second.js": "js/bundles/second.js"
        }
      }
    },
    "standaloneFiles": {
      "bundles/first.js": "src/java/first.js",
      "bundles/second.js": "src/java/second.js"
    }
  }
}
```

where:
artefactId - override artefact ID for grails plugins, by default will be taken from project.name
external-resources - grails resource ID
external-resources/files - copy files relative web-app dir
standaloneFiles - copy files relative root dir

To be able to deploy grails plugins you need to have Maven v3.x to be installed
and mvn (or mvn.cmd under Windows) available in PATH.
