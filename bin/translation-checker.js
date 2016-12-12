#!/usr/bin/env node

var program = require('commander');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var flatten = require('flat');
var lodash = require('lodash');

program
  .version(require('../package.json').version)
  .option('-p, --path [dir]', 'path to find bundles, default [src]')
  .option('-pl, --primary_language [language]', 'primary language, default [en]')
  .option('-sl, --secondary_languages [languages]', 'secondary comma separated languages, default [de]')
  .description('Deploys grails plugin to maven repository');

program.on('--help', function () {
  console.log(' for examples:');
  console.log('');
  console.log('   translation-checker --path src --primary_language en --secondary_languages de,fr');
  console.log('');
});

program.parse(process.argv);

var foundPath = 'src';
var pLanguage = 'en';
var sLanguages = ['de'];

if (program.path) {
  foundPath = program.path
}

if (program.primary_language) {
  pLanguage = program.primary_language
}

if (program.secondary_languages) {
  sLanguages = program.secondary_languages.split(',')
}

var languages = lodash.clone(sLanguages);
languages.push(pLanguage);

var objectToProperties = function(translations) {
  return flatten(translations.default);
};

var getkeys = function(bundle) {
  var keys = [];
  for (var i = 0; i < languages.length; i++) {
    var language = languages[i];
    var translations = bundle[language];
    if (translations) {
      for (var key in translations) {
        if (keys.indexOf(key) === -1) {
          keys.push(key);
        }
      }
    }
  }

  return keys;
};

var checkMissingTranslations = function(bundles) {
  console.log('check missing translations');

  for (var filename in bundles) {
    var bundle = bundles[filename];

    var keys = getkeys(bundle);
    var pTranslations = bundle[pLanguage];

    if (pTranslations) {
      for (var i = 0; i < sLanguages.length; i++) {
        var language = sLanguages[i];
        var translations = bundle[language];

        if (translations) {
          for (var k = 0; k < keys.length; k++) {
            var key = keys[k];

            if (translations[key] === pTranslations[key]) {
              console.log("missing translation for key [" + key + "] in bundle [" + filename + "] for language [" + language + "]")
            }
          }
        }
      }
    }
  }
};

var checkMissingTranslationKeys = function(bundles) {
  console.log('check missing translation keys');
  for (var filename in bundles) {
    var bundle = bundles[filename];

    var keys = getkeys(bundle);
    for (var i = 0; i < languages.length; i++) {
      var language = languages[i];
      var translations = bundle[language];
      if (translations) {
        for (var k = 0; k < keys.length; k++) {
          var translationKey = keys[k];
          if (!translations[translationKey]) {
            console.log("missing translation key [" + translationKey + "] in bundle [" + filename + "] for language [" + language + "]");
          }
        }
      }
    }
  }
};

var checkMissingLanguages = function(bundles) {
  console.log('check missing translation languages');
  for (var filename in bundles) {
    var bundle = bundles[filename];

    for (var i = 0; i < languages.length; i++) {
      var language = languages[i];
      if (!bundle[language]) {
        console.log("missing language [" + language + "] in translation bundle [" + filename + "]")
      }
    }
  }
};

console.log("found files: " + foundPath + '/**/*/i18n')

glob(foundPath + '/**/*/i18n', function(err, files) {
  var bundles = {};

  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    var bundle = {};
    bundles[file] = bundle;

    for (var k = 0; k < languages.length; k++) {
      var language = languages[k];
      var translationFile = path.join(file, language + '.js');

      if (fs.existsSync(translationFile)) {
        var loadedTranslations = require(path.join(file, language));
        bundle[language] = objectToProperties(loadedTranslations);
      } else {
        bundle[language] = null;

        console.log('file not found ' + translationFile)
      }
    }
  }

  for (var filename in bundles) {
    console.log("found bundle [" + filename + "]");
  }

  checkMissingLanguages(bundles);
  checkMissingTranslations(bundles);
  checkMissingTranslationKeys(bundles);
});
