"use strict";

const fs = require ('fs')
    , path = require ('path')
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);


async function replaceInFile (filename, regex, replacement) {
    const contents = await readFileAsync (filename, 'utf8')
    const newContents = contents.replace (regex, replacement)
    fs.truncateSync (filename)
    await writeFileAsync (filename, newContents)
}

async function copyFile (oldName, newName) {
    const contents = await readFileAsync (oldName, 'utf8')
    fs.truncateSync (newName)
    await writeFileAsync (newName, contents)
}

async function overwriteFile (filename, contents) {
    // log.cyan ('Overwriting → ' + filename.yellow)
    fs.closeSync (fs.openSync (filename, 'a'));
    fs.truncateSync (filename)
    await writeFileAsync (filename, contents)
}

function createFolder (folder) {
    try {
        fs.mkdirSync (folder)
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err
        }
    }
}

function createFolderRecursively (folder) {
    const parts = folder.split (path.sep)
    for (let i = 1; i <= parts.length; i++) {
        createFolder (path.join.apply (null, parts.slice (0, i)))
    }
}

module.exports = {
    replaceInFile,
    copyFile,
    overwriteFile,
    createFolder,
    createFolderRecursively,
}
