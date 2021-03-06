
let inquirer = require('inquirer');
let fs = require('fs-extra');
let androidLanguages = ["de-DE","en-US","es-ES","fr-FR","it-IT","ja-JP","pt-BR"];
let iosLanguages = ["default","de-DE","es-ES","fr-FR","it","ja","pt-BR"];
let macosLanguages = ["default","de-DE","es-ES","fr-FR","it","ja","pt-BR"];
let dotenv = require('dotenv');
dotenv.config();
let androidMetadataPath = process.env.ANDROID_METADATA_PATH || "metadata/android";
let iosMetadataPath = process.env.IOS_METADATA_PATH || "metadata/ios";
let macosMetadataPath = process.env.MACOS_METADATA_PATH || "metadata/macos";
let flutterRoot = process.env.FLUTTER_PROJECT_ROOT || "../";

async function getPubspecVersion(){
  let pubspec = await fs.readFile(`${flutterRoot}/pubspec.yaml`);
  let versionLine = pubspec.toString().match(/version\:.*?\n/);
  let match = versionLine[0];
  let version = match.match(/\d+?\.\d+?\.\d*/)[0];
  return version;
}

async function run(){
  let version = await getPubspecVersion();
  let answers = await inquirer.prompt([{
    type: "input",
    name: "package_version",
    message:"What's the package version number?",
    default:version
  },
  {
    type: "editor",
    name: "file_contents",
    message:"What's new?"
  }]);

  let package_version = answers.package_version.replace(/\./g, '0');
  
  androidLanguages.forEach((language)=>{
    let androidDirPath = `${androidMetadataPath}/${language}/changelogs`;
    if(!fs.existsSync(androidDirPath)){
      fs.mkdirpSync(androidDirPath);
    }
    let androidPath = `${androidDirPath}/${package_version}.txt`;
    fs.writeFile(androidPath, answers.file_contents);
  });

  iosLanguages.forEach((language)=>{
    let iosDirPath = `${iosMetadataPath}/${language}`;
    if(!fs.existsSync(iosDirPath)){
      fs.mkdirpSync(iosDirPath);
    }
    let iosLanguagePath = `${iosDirPath}/release_notes.txt`;
    fs.writeFile(iosLanguagePath, answers.file_contents);
  });

  macosLanguages.forEach((language)=>{
    let macosDirPath = `${macosMetadataPath}/${language}`;
    if(!fs.existsSync(macosDirPath)){
      fs.mkdirpSync(macosDirPath);
    }
    let macosLanguagePath = `${macosDirPath}/release_notes.txt`;
    fs.writeFile(macosLanguagePath, answers.file_contents);
  });
}

run();