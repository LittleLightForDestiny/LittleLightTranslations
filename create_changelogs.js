
let inquirer = require('inquirer');
let fs = require('fs-extra');
let languages = ["de-DE","en-US","es-ES","fr-FR","it-IT","ja-JP","pt-BR"];
let iosLanguages = ["de-DE","es-ES","fr-FR","it","ja","pt-BR"];

async function run(){
  var answers = await inquirer.prompt([{
    type: "input",
    name: "package_version",
    message:"What's the package version number?"
  },
  {
    type: "editor",
    name: "file_contents",
    message:"What's new?"
  }]);
  var iosPath = `./metadata/ios/default/release_notes.txt`;
  fs.writeFile(iosPath, answers.file_contents);
  languages.forEach((language)=>{
    var androidPath = `./metadata/android/${language}/changelogs/${answers.package_version}.txt`;
    if(!fs.existsSync(androidPath)){
      fs.writeFile(androidPath, answers.file_contents);
    }
  });

  iosLanguages.forEach((language)=>{
    var iosLanguagePath = `./metadata/ios/${language}/release_notes.txt`;
    fs.writeFile(iosLanguagePath, answers.file_contents);
  });
}

run();