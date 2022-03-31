var finder = require('find-in-files');
var fs = require('fs-extra');
let languages = ["en"];


async function findStrings() {
  let results = await finder.find(/TranslatedTextWidget\(\s*?["'](.*?)["'].*?[;,)]/, './../lib', '.dart$');
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
    let regexpSingleQuote = /TranslatedTextWidget\(.[^"]*?['](.*?)[']/s;
    let regexpDoubleQuote = /TranslatedTextWidget\(.*?["](.*?)["]/s;
    let regMatch = regexpSingleQuote.exec(match) || regexpDoubleQuote.exec(match);
    if (regMatch) {
      let matchResult = regMatch[1];
      foundStrings.push(matchResult);
    };
  }
}

async function copyOriginalLanguageFiles() {
  for (var i in languages) {
    let language = languages[i];
    let exists = await fs.exists(`./languages/${language}.json`);
    if (!exists) {
      await fs.copy(`../assets/i18n/${language}.json`, `./languages/${language}.json`);
    }
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
  // copyOriginalLanguageFiles();
  await createEmptyFiles();
  let strings = await findStrings();
  let result = await updateLanguageFiles(strings);
  printResults(result);
}

run();