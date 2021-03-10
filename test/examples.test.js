const { pipe, parse, open, $, $$, attr, text, dump, iteratorToArray } = require('../dist/index.js');
const R = require('ramda')
const fs = require('fs')
const readline = require('readline')
const path = require('path')



function loadJSONFile(fpath, del = true) {
    const contents = JSON.parse(fs.readFileSync(fpath))
    if (del) {
        fs.unlinkSync(fpath)
    }
    return contents
}

async function loadJSONLFile(fpath, del = true) {
    const fileStream = fs.createReadStream(fpath)
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    res = []
    for await (const line of rl) {
        res.push( JSON.parse(line) )
    }
    if (del) {
        fs.unlinkSync(fpath)
    }
    return res
}




test('example1, one page, quotes', async () => {
    const config = {
        save: path.resolve(__dirname, 'output1.json'),
        root: 'http://quotes.toscrape.com',
        parse: pipe(open, $$('.quote > .text'), text)
    }

    await parse(config)

    expect( loadJSONFile(config.save) )
        .toEqual( JSON.parse(fs.readFileSync(path.resolve(__dirname, 'example1.json')).toString()) )
});



test('example2, one page, quotes, authors, tags', async () => {
    const config = {
        save: path.resolve(__dirname, 'output2.jsonl'),
        root: 'http://quotes.toscrape.com',
        parse: pipe(
            open, 
            $$('.quote'), 
            {
                quote: $('.text'),
                author: $('.author'),
                bio: pipe($('a'), open, $('.author-description'), text, s => s.trimStart().substring(0, 20) + '…'),
                tags: pipe($$('.tags > .tag'), text)
            }
        )
    }

    await parse(config)

    expect(await loadJSONLFile(config.save)).toEqual( await loadJSONLFile(path.resolve(__dirname, 'example2.json'), false) )
})
