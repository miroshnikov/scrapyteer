const { pipe, scrape, open, $, $$, attr, text, save, dump, flattenNext } = require('../dist/index.js');
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
        parse: pipe(open(), $$('.quote > .text'))
    }

    await scrape(config)

    expect( loadJSONFile(config.save) )
        .toEqual( JSON.parse(fs.readFileSync(path.resolve(__dirname, 'results/example1.json')).toString()) )
});


test('example1.1, javascript generated', async () => {
    const config = {
        save: path.resolve(__dirname, 'output1_1.json'),
        root: 'http://quotes.toscrape.com/js/',
        parse: pipe(open(), $$('.quote > .text'))
    }

    await scrape(config)

    expect( loadJSONFile(config.save) )
        .toEqual( JSON.parse(fs.readFileSync(path.resolve(__dirname, 'results/example1.json')).toString()) )
});


test('example1.2, author info', async () => {
    const config = {
        save: path.resolve(__dirname, 'output1_2.json'),
        root: 'http://quotes.toscrape.com/author/Albert-Einstein/',
        parse: pipe(
            open(),
            {
                name: $('.author-title'),
                birthdate: $('.author-born-date'),
                bio: $('.author-description')
            }
        )
    }

    await scrape(config)

    expect( loadJSONFile(config.save) )
        .toEqual( JSON.parse(fs.readFileSync(path.resolve(__dirname, 'results/example1_2.json')).toString()) )
});




test('example2, one page, quotes, authors, tags', async () => {
    const config = {
        save: path.resolve(__dirname, 'output2.jsonl'),
        root: 'http://quotes.toscrape.com',
        parse: pipe(
            open(), 
            $$('.quote'), 
            {
                quote: $('.text'),
                author: $('.author'),
                bio: pipe($('a'), open(), $('.author-description'), text, s => s.trimStart().substring(0, 20) + '…'),
                tags: $$('.tags > .tag')
            }
        )
    }

    await scrape(config)

    expect(await loadJSONLFile(config.save)).toEqual( await loadJSONLFile(path.resolve(__dirname, 'results/example2.jsonl'), false) )
})



test('example3, 3 first pages, quotes', async () => {
    const config = {
        save: path.resolve(__dirname, 'output3.jsonl'),
        root: 'http://quotes.toscrape.com',
        parse: pipe(
            flattenNext(1),
            R.map(n => '/page/'+n+'/', R.range(1,4)),
            open(), 
            $$('.quote'), 
            {
                quote: $('.text'),
                author: $('.author'),
                bio: pipe($('a'), open(), $('.author-description'), text, s => s.trimStart().substring(0, 20) + '…'),
                tags: $$('.tags > .tag')
            }
        )
    }

    await scrape(config)

    expect(await loadJSONLFile(config.save)).toEqual( await loadJSONLFile(path.resolve(__dirname, 'results/example3.jsonl'), false) )
})



test('example4, authors', async () => {
    const config = {
        save: path.resolve(__dirname, 'output4.jsonl'),
        noRevisit: true,
        root: 'http://quotes.toscrape.com',
        parse: pipe(
            open(), 
            $$('.author + a'), 
            open(),
            {
                name: $('h3.author-title'),
                birthdate: $('.author-born-date')
            }
        )
    }

    await scrape(config)

    expect(await loadJSONLFile(config.save)).toEqual( await loadJSONLFile(path.resolve(__dirname, 'results/example4.jsonl'), false) )
})



test('example5, products with images', async () => {
    const config = {
        save: path.resolve(__dirname, 'output5.jsonl'),
        root: 'http://books.toscrape.com',
        parse: pipe(
            open(),
            $$('h3 > a'),
            open(),
            {
                name: $('h1'),
                price: pipe( $('.price_color'), text, s => s.substring(1), parseFloat ),
                attributes: pipe( $$('.table-striped tr'), [$('th'), $('td')] ),
                image1: pipe( $('#product_gallery .thumbnail img'), attr('src'), save() ),
                image2: pipe( $('#product_gallery .thumbnail img'), save({dir: 'product-images', saveAs: (nm,ext) => 'product_'+nm+ext}) )
            }
        )
    }

    await scrape(config)

    expect(await loadJSONLFile(config.save)).toEqual( await loadJSONLFile(path.resolve(__dirname, 'results/example5.jsonl'), false) )

    let files = fs.readdirSync(path.resolve('./files'))
    expect( files.length ).toBe(20)
    expect( files.includes('08e94f3731d7d6b760dfbfbc02ca5c62.jpg') ).toBe(true)
    expect( fs.statSync(path.resolve('./files', '08e94f3731d7d6b760dfbfbc02ca5c62.jpg')).size ).toBe(18504)
    fs.rmSync(path.resolve('./files'), { recursive: true })

    expect( fs.readdirSync(path.resolve('./product-images')).length ).toBe(20)
    fs.rmSync(path.resolve('./product-images'), { recursive: true })
})
