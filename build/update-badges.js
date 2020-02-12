// ---------------------------------------------------------------------------
// Usage:
//
//      npm run update-badges
// ---------------------------------------------------------------------------

(async function(){

    "use strict";

    const fs = require ('fs')
    const ccxt = require ('../ccxt')
    const log  = require ('ololog')
    const ansi = require ('ansicolor').nice
    const util = require('util');
    const readFileAsync = util.promisify(fs.readFile);
    const writeFileAsync = util.promisify(fs.writeFile);

    //-----------------------------------------------------------------------------

    let readmeRst = './python/README.rst'

    log.bright.cyan ('Preparing for PyPI →', readmeRst.yellow)

    let rst = await readFileAsync (readmeRst, 'utf8')
    let rstNew = rst.replace (/\`([^\`]+)\s\<\#[^\`]+\>\`\_\_/g, '$1') // PyPI doesn't like urls containing anchor hash symbol '#', strip it off to plain text
                    .replace (/\\\|/g, '|')                    // PyPI doesn't like escaped vertical bars
                    .replace (/\\\_/g, ' _')                   // PyPI doesn't like escaped underscores
                    .replace (/\|(\_[^\|]+)\|([\ ]+)\|/g, '|$1| $2|')
                    // .replace (/\|\\(\_[^\|]+)\|/g, '|$1|')

    let rstExchangeTableRegex = /([\s\S]+?)APIs:(?:(?:[\r][\n]){2}|[\n]{2})(\+\-\-[\s\S]+\-\-\+)(?:(?:[\r][\n]){2}|[\n]{2})([\s\S]+)/
    let match = rstExchangeTableRegex.exec (rstNew)

    let rstExchangeTableLines = match[2].split ("\n")

    let newRstExchangeTable = rstExchangeTableLines.map (line => {
        return line.replace (/(\||\+)(.).+?(\s|\=|\-)(\||\+)/, '$1') // replace ascii table graphics
    }).join ("\n")

    rstNew = match[1] + "APIs:\n\n" + newRstExchangeTable + "\n\n" + match[3]

    fs.truncateSync (readmeRst)
    await writeFileAsync (readmeRst, rstNew)

    //-----------------------------------------------------------------------------

    ;([
        './doc/README.rst',
        './doc/manual.rst',
        './doc/install.rst',
        './doc/exchanges.rst',
        './doc/exchanges-by-country.rst',

    ]).forEach (async file => {

        let rst = await readFileAsync (file, 'utf8')
        let rstNew = rst.replace (/\|\\(\_[^\s]+)\|\s+image/g, '|$1| image')
                        .replace (/\|\\(\_[^\s]+)\|/g, '|$1| ')
                        .replace (/\\(\_1broker|\_1btcxe)/g, '$1 ')
        fs.truncateSync (file)
        await writeFileAsync (file, rstNew)

    })

    //-----------------------------------------------------------------------------

    async function updateExchangeCount (fileName) {

        log.bright.cyan ('Updating exchange count →', fileName.yellow)

        let oldContent = await readFileAsync (fileName, 'utf8')
        let newContent =
            oldContent.replace (/shields\.io\/badge\/exchanges\-[0-9a-z]+\-blue/g, 'shields.io/badge/exchanges-' + ccxt.exchanges.length + '-blue')


        fs.truncateSync (fileName)
        await writeFileAsync (fileName, newContent)

    }

    await updateExchangeCount ('./README.md')
    await updateExchangeCount (readmeRst)

    log.bright.green ('Badges updated successfully.')

    //-----------------------------------------------------------------------------

}());
