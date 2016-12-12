# JS - Npm scripts

## Synopsis
Package provides an unified approach for make **npm package** and **grails plugin** releases from npm packages.

## Usage

### Npm goals

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
  
* `decorate-jenkinsfile` - generate [Jenkinsfile](https://jenkins.io/doc/book/pipeline/jenkinsfile/) from your Jenkinsfile.stages

  It allows to simplify build scripts update across repositories using templates. Templates contains configuration of build status notifications, global tools installed on Jenkins build-server, etc.
  
  `--template, -t` - specify template name from [list](./jenkinsfile-templates). Default: [node6-yarn-maven3](./jenkinsfile-templates/node6-yarn-maven3)

### NPM publish example

**package.json**

```json
...
"scripts": {
  "npm-build": "rimraf ./lib && webpack --config ./webpack.production.config",
  "npm-publish": "npm run npm-build && npm-publish",
  "publish-release": "npm run npm-publish -- --release",
  "publish-snapshot": "npm run npm-publish"
}
...
```

### Grails plugin configuration
If you want **publish module as grails resources**, you can add grails section in your **package.json**

**package.json**

```json
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
...
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
