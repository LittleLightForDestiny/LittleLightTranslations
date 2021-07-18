const { default: axios } = require("axios");
const fs = require("fs-extra");


async function run() {
    const files = await fs.readdir('./languages');
    for (let file of files) {
        await clean(file);
    }
}

async function clean(filename) {
    console.log(`cleaning cache for ${filename}`)
    const url = `https://cdn.jsdelivr.net/gh/LittleLightForDestiny/LittleLightTranslations/languages/${filename}`;
    const result = await axios.get(url);
    console.log(result.data);
}

run();