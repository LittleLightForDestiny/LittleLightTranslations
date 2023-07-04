var finder = require('find-in-files');
var fs = require('fs-extra');
let languages = ["en"];


async function findStrings() {
  let results = await finder.find(/"(.*?)"[\n \r]*\.translate\(/, './../lib', '.dart$');
  return parseResults(results);
}

function parseResults(results) {
  let foundStrings = [];
  for (let i in results) {
    let result = results[i];
    parseResult(i, result, foundStrings);
  }
  return foundStrings;
}

function parseResult(key, result, foundStrings) {
  for (let i in result.matches) {
    if (!result.matches[i]) continue;
    let match = result.matches[i];
    let regexp = /"(.*?)"[\n \r]*\.translate\(/s;
    let regMatch = regexp.exec(match);
    if (regMatch) {
      let matchResult = regMatch[1];
      foundStrings.push(matchResult);
    };
  }
}

async function createEmptyFiles() {
  for (var i in languages) {
    let language = languages[i];
    let exists = await fs.exists(`./languages/${language}.json`);
    if (!exists) {
      await fs.createFile(`./languages/${language}.json`);
      await fs.writeJSON(`./languages/${language}.json`, {});
    }
  }
}

async function updateLanguageFiles(strings) {
  let missingStrings = {};
  for (var i in languages) {
    await updateLanguageFile(languages[i], strings, missingStrings);
  }
  return missingStrings;
}

async function updateLanguageFile(language, strings, missingStrings) {
  let contents = await fs.readJson(`./languages/${language}.json`);
  for (var i in strings) {
    let str = strings[i];
    let placeholder = `${str}`;
    if (!contents[str]) {
      if (!missingStrings[language]) missingStrings[language] = [];
      missingStrings[language].push(str);
    }
    if (!contents[str] && !contents[placeholder]) {
      contents[placeholder] = placeholder;
    }
  }
  await fs.writeJson(`./languages/${language}.json`, contents, { spaces: 4 });
}

async function checkDuplicatedKeys(language){
  let contents = await fs.readJson(`./languages/${language}.json`);
  let keys = Object.keys(contents).map((k)=>k.toLowerCase())
  let unique = [];
  let duplicates = [];
  for(let key of keys){
    if(unique.includes(key)){
      duplicates.push(key);
    }else{
      unique.push(key);
    }
  }
  let divider = '--------------------------------------------------------------------------------';
  console.log('Duplicated strings')
  console.log(divider)
  for(let duplicate of duplicates){
    console.log(`   - ${duplicate}`)
  }
}

function printResults(result) {
  let divider = '--------------------------------------------------------------------------------';
  for (let language in result) {
    let results = result[language];
    console.log(divider);
    console.log(language);
    console.log(`Missing ${results.length} translations:`)
    for (var i in results) {
      console.log(`   - ${results[i]}`)
    }
    console.log(divider);
    console.log('');
  }
}

async function run() {
  await fs.mkdirp('./languages');
  await createEmptyFiles();
  let strings = await findStrings();
  let result = await updateLanguageFiles(strings);
  printResults(result);
  checkDuplicatedKeys('en');
}

run();