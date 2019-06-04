
let inquirer = require('inquirer');
let fs = require('fs-extra');
let languages = ["de-DE","en-US","es-ES","fr-FR","it-IT","ja-JP","pt-BR"];

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
  languages.forEach((language)=>{
    var androidPath = `./metadata/android/${language}/changelogs/${answers.package_version}.txt`;
    if(!fs.existsSync(androidPath)){
      fs.writeFile(androidPath, answers.file_contents);
    }
  });
  var iosPath = `./metadata/ios/default/release_notes.txt`;
  fs.writeFile(iosPath, answers.file_contents);
}

run();