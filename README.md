# OpusCapita npm scripts

## Synopsis

Package provides an unified release/build approach for **npm package** and **grails plugin** from npm packages.

## Usage

### Goals

#### npm-publish
Updates CHANDELOG.md and publishes npm module (all changes are committed and pushed to GIT repository)

##### options
- `npm-publish --test` - generates npm package and saves as local file (tarball will be created instead of publishing to NPM)
- `npm-publish --release` - creates release, publishes the package to local repo with calling `update-changelog` goal

#### update-changelog
Updates CHANGELOG.md that contains changes between the releases

##### options
- `update-changelog --all` - completely regenerate full CHANGELOG.md with all changes between all the releases

#### grails-plugin-install
Installs grails plugin to local repository

##### options
- `grails-plugin-install --release` - installs plugin as release

#### grails-plugin-deploy
Deploys grails plugin to remote repository

##### options
- `grails-plugin-deploy --release` - deploys plugin as release

#### grails-plugin-package
Packages grails plugin

##### options
- `grails-plugin-package --release` - package plugin as release

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
If you want **publish module as grails resources**, you can add **grails** section in your **package.json**

**package.json (simple resource files definition)**
```json
...
"grails": {
  "artefactId": "simple-js-resources",
  "groupId":"com.opuscapita.grailsplugins",
  "resources": {
    "simple-resource-module": {
      "dependsOn": ["jquery"],
      "defaultBundle": false,
      "files": {
        "bundles/first.js": "js/bundles/first.js",
        "bundles/second.js": "js/bundles/second.js"
      }    
    }
  },
  "standaloneFiles": {
    "bundles/first.js": "src/java/first.js",
    "bundles/second.js": "src/java/second.js",
    "resources/fonts": "web-app/fonts"
  }
}
...
```

**package.json (extended resource files definition)**
```json
...
"grails": {
  "artefactId": "extended-js-resources",
  "groupId": "com.opuscapita.grailsplugins",
  "resources": {
    "complex-resource-module": {
      "files": [{
        "source": "bundles/first.js",
        "target": "js/bundles/first.js",
        "attrs": {
          "type": "js"
        }
      }, {
        "source": "bundles/second.js",
        "target": "js/bundles/second.js",
        "attrs": {
          "type": "js"
        }
      }]
    }
  }
}
...
```

* `artefactId` - override artefact ID for grails plugins, by default will be taken from project.name
* `groupId` - override group ID for grails plugins, by default will be com.opuscapita.grailsplugins
* `resources` - defines resource bundles (used Grails Resource plugin) that shpuld be generated
    * `external-resources` - String, resource unique name/ID
        * `dependsOn` - Array of grails resource module IDs (not required)
        * `defaultBundle` - String or Boolean, defines grails resource module defaultBundle value (not required)
        * `files` - copy files relative web-app dir (should be Object or Array, see examples above)
* `standaloneFiles` - copy files relative root dir

**To be able to deploy grails plugins you must to have Maven v3.x to be installed
and mvn (or mvn.cmd under Windows) available in PATH.**

## Contributors

* Dmitry Divin dmitriy.divin@jcatalog.com
* Alexey Sergeev alexey.sergeev@jcatalog.com

## License

**OpusCapita npm-scripts** is licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE) for the full license text.
