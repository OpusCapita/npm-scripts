#!/usr/bin/env node

'use strict'

let fs = require('fs');
let path = require('path');
let commander = require('commander');
let pathToTemplates = path.resolve(__dirname, '../jenkinsfile-templates');

function getTemplatesList() {
  let templatesList = fs.readdirSync(pathToTemplates);
  return templatesList;
}

function getTemplateContent(templateName) {
  let pathToTemplate = path.resolve(pathToTemplates, `./${templateName}`);
  let templateContent = fs.readFileSync(pathToTemplate, 'utf-8');
  return templateContent;
}

function getStagesContent(stagesFilePath) {
  let stagesContent = fs.readFileSync(stagesFilePath, 'utf-8');
  return stagesContent;
}

function handleShowTemplatesList() {
  let templatesList = getTemplatesList();
  templatesList.map(template => console.log(template));
}

function getJenkinsFileContent(stagesContent, templateContent) {
  let jenkinsfileContent = templateContent ? (
    templateContent.replace('__PLACE_FOR_OTHER_STAGES__', stagesContent)
  ) : stagesContent;
  return jenkinsfileContent;
}

function decorateJenkinsFile(templateName) {
  let projectPath = process.cwd();
  let stagesFilePath = commander.source || path.resolve(projectPath, './Jenkinsfile.stages');
  let templateContent = getTemplateContent(templateName);
  let stagesContent = getStagesContent(stagesFilePath);
  let jenkinsFileContent = getJenkinsFileContent(stagesContent, templateContent);
  let jenkinsFilePath = path.resolve(projectPath, './Jenkinsfile');
  fs.writeFileSync(jenkinsFilePath, jenkinsFileContent);
}

commander
  .option('-l, --ls', 'show templates list')
  .option('-t, --template', 'specify template')
  .option('-s, --source', 'specify Jenkinsfile.stages path. "./Jenkinsfile.stages" by default')
  .parse(process.argv);

if(commander.ls) {
  return handleShowTemplatesList();
}

let templateName = commander.template || 'node6-yarn-maven3';
decorateJenkinsFile(templateName);
