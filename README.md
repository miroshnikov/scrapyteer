# Scrapyteer

Scrapyteer is a **web scraping/crawling tool** built on top of the headless Chrome browser.        
It allows you to scrape both plain html pages and javascript generated content including SPAs (Single-Page Application) of any kind.
Scrapyteer offers a small set of functions that forms an easy and concise DSL (Domain Specific Language) for web scraping and allows to define a **crawling workflow** and a **shape of output data**. 

## Installation
#### Locally 
```sh
npm i -D scrapyteer
npm exec -- scrapyteer --config myconf.js.  # or npx scrapyteer --config myconf.js
```
#### Locally as dependency
```sh
npm init
npm i -D scrapyteer
```
in `package.json`:
```json
"scripts": {
  "scrape": "scrapyteer --config myconf.js"
}
```
```sh
npm run scrape
```

#### Globally
```sh
npm install -g scrapyteer
scrapyteer --config myconf.js
```
Make sure `$NODE_PATH` points to where global packages are located. 
If it is not, you may need to set it e.g. `export NODE_PATH=/path/to/global/node_modules`

## Examples
Scrapyteer uses a configuration file (`scrapyteer.config.js` by default). Here are some examples:
* Get all quotes from [quotes.toscrape.com](http://quotes.toscrape.com) as array and save to JSON
```js
const { pipe, open, $$ } = require('scrapyteer');

module.exports = {
    save: 'result.json',
    root: 'http://quotes.toscrape.com',
    parse: pipe(
      open(), 
      $$('.quote > .text')
    )
}
```
* Get quotes from [quotes.toscrape.com](http://quotes.toscrape.com) as array of objects with the properties: quote text, author name, first 20 symbols of author biography (follow a link to another page) and array of tags.
```js
const { pipe, open, $, $$, text } = require('scrapyteer');

module.exports = {
    save: 'result.jsonl',
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
```
* Get products from [books.toscrape.com](http://books.toscrape.com) with name, price, attributes (as array of `[name, value]`) and images. Image files will be saved in `product-images` directory.
```js
const { pipe, open, $, $$, text, save } = require('scrapyteer');

module.exports = {
    save: 'result.jsonl',
    root: 'http://books.toscrape.com',
    parse: pipe(
        open(),
        $$('h3 > a'),
        open(),
        {
            name: $('h1'),
            price: pipe( $('.price_color'), text, s => s.substring(1), parseFloat ),
            attributes: pipe( $$('.table-striped tr'), [$('th'), $('td')] ),
            image: pipe( $('#product_gallery .thumbnail img'), save({dir: 'product-images'}) )
        }
    )
}
```
First row in `result.jsonl` is:
```json
{
  "name":"A Light in the Attic",
  "price":51.77,
  "attributes":[
    ["UPC","a897fe39b1053632"],
    ["Product Type","Books"],
    ["Price (excl. tax)","£51.77"],
    ["Price (incl. tax)","£51.77"],
    ["Tax","£0.00"],
    ["Availability","In stock (22 available)"],
    ["Number of reviews","0"]
  ],
  "image":"fe72f0532301ec28892ae79a629a293c.jpg"
}
```
* Get product titles from the first three pages of catalog at [books.toscrape.com](http://books.toscrape.com)
```js
const { pipe, open, $, $$, text, flattenNext } = require('scrapyteer');

module.exports = {
    save: 'result.json',
    root: 'http://books.toscrape.com',
    log: true,
    parse: pipe(
        flattenNext(1),  // or else results from every page will be in separate arrays
        [...Array(3).keys()].map(n => `/catalogue/page-${n+1}.html`),
        open(),
        $$('h3 > a'),
        open(),
        $('h1'),
        text
    )
}
```
