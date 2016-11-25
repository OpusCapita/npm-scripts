# JS - NPM scripts

## Synopsis
Package provides an unified approach for make **npm package** and **grails plugin** releases from **npm packages**.

## Usage

### NPM goals

* `npm-publish` - build and publish npm module to local repository

  `--test` - generate npm package and save as local file

  `--release` - create release, publish the package to local repo and update CHANGES.txt what was changed between releases

* `grails-plugin-install` - package and install grails plugin to local repository

  `--release` - install plugin as release

* `grails-plugin-deploy` - package and install grails plugin to remote repository

  `--release` - deploy plugin as release

* `grails-plugin-package` - package grails plugin

  `--release` - package plugin as release

* `grails3-plugin-install` - package and install grails 3 plugin to local repository

  `--release` - install plugin as release

* `grails3-plugin-deploy` - package and install grails 3 plugin to remote repository

  `--release` - deploy plugin as release

* `grails3-plugin-package` - package grails 3 plugin

  `--release` - package plugin as release

### Grails plugin configuration
If you want **publish module as grails resources**, you can add grails section in your **package.json**

**Example:**

```json
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

* `artefactId` - override artefact ID for grails plugins, by default will be taken from project.name
* `external-resources` - grails resource ID
* `external-resources/files` - copy files relative web-app dir
* `standaloneFiles` - copy files relative root dir

**To be able to deploy grails plugins you must to have Maven v3.x to be installed
and mvn (or mvn.cmd under Windows) available in PATH.**

## Contributors

* Dmitry Divin dmitriy.divin@jcatalog.com
* Alexey Sergeev alexey.sergeev@jcatalog.com

## License

OpusCapita 2016
