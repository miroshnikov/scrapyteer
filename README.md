# Scrapyteer

Scrapyteer is a Node.js **web scraping** framework/tool/library built on top of the headless Chrome browser Puppeteer.        
It allows you to scrape both plain html pages and javascript generated content including SPAs (Single-Page Application) of any kind.
Scrapyteer offers a small set of functions that forms an easy and concise DSL (Domain Specific Language) for web scraping and allows to define a **crawling workflow** and a **shape of output data**. 

## Installation
### Locally 
```sh
npm i -D scrapyteer
npm exec -- scrapyteer --config myconf.js.  # OR npx scrapyteer --config myconf.js
```
### Locally as dependency
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

### Globally
```sh
npm install -g scrapyteer
scrapyteer --config myconf.js
```
Make sure `$NODE_PATH` points to where global packages are located. 
If it doesn't, you may need to set it e.g. `export NODE_PATH=/path/to/global/node_modules`

## Examples
Scrapyteer uses a configuration file (`scrapyteer.config.js` by default). 
Here are some examples:

### Simple example
Search books on [amazon.com](https://www.amazon.com) and get titles and ISBNs of books on the first page of the results.

```js
const { pipe, open, select, enter, $$, $, text } = require('scrapyteer');

module.exports = {
    root: 'https://www.amazon.com',
    parse: pipe(
        open(),     // open amazon.com
        select('#searchDropdownBox', 'search-alias=stripbooks-intl-ship'),  // select 'Books' in dropdown
        enter('#twotabsearchtextbox', 'Web scraping'),   // enter search phrase 'Web scraping'
        $$('.a-section h2'),    // for every H2 on page
        {
            name: text,         // name = inner text of H2 element
            ISBN: pipe(         // go to link and grab ISBN from there if present
                $('a'),
                open(),         // open 'href' attribute of passed A element
                $('#rpi-attribute-book_details-isbn13 .rpi-attribute-value span'), 
                text            // grab inner text of a previously selected element
            )
        }
    )
}
/*
output.json

[
    {
        "name": "Web Scraping with Python: Collecting More Data from the Modern Web  ",
        "ISBN": "978-1491985571"
    },
    ...
]
*/
```

### More elaborate example
Search books on [amazon.com](https://www.amazon.com), get a number of attributes in `JSON lines` file and download the cover image of each book to a local directory.
```js
const { pipe, open, select, enter, $$, $, text } = require('scrapyteer');

module.exports = {
    root: 'https://www.amazon.com',
    save: 'books.jsonl',   // saves as jsonl
    parse: pipe(
        open(),     // open amazon.com
        select('#searchDropdownBox', 'search-alias=stripbooks-intl-ship'),  // select 'Books' in dropdown
        enter('#twotabsearchtextbox', 'Web scraping'),   // enter search phrase
        $$('.a-section h2 > a'),    // for every H2 link on page
        open(),         // open 'href' attribute of passed A element
        {
                // on book's page grab all the necessary values
            name: $('#productTitle'),
            ISBN: $('#rpi-attribute-book_details-isbn13 .rpi-attribute-value span'),
            stars: pipe($('#acrPopover > span > a > span'), text, parseFloat),  // number of stars as float
            ratings: pipe($('#acrCustomerReviewLink > span'), text, parseInt),   // convert inner text that looks like 'NNN ratings' into an integer
            cover: pipe(                // save cover image as a file and set cover = file name
                $(['#imageBlockContainer img', '#ebooks-main-image-container img']),     // try several selectors
                save({dir: 'cover-images'})
            )   
        }
    )
}
/*
books.jsonl

{"name":"Web Scraping with Python: Collecting More Data from the Modern Web","ISBN":"978-1491985571","stars":4.6,"ratings":201,"cover":"sitb-sticker-v3-small._CB485933792_.png"}
{"name":"Web Scraping Basics for Recruiters: Learn How to Extract and Scrape Data from the Web","ISBN":null,"stars":4.9,"ratings":15,"cover":"41esb-CVhsL.jpg"}
...
*/
```

## Configuration options

### save 
A file name or `console` object, by default `output.json` in the current directory.     
`*.json` and `*.jsonl` are currently supported.   
If format is `json` the data is first collected in memory and then dumped to the file in one go, in `jsonl` data is written line by line (good for large datasets).

### root
The root URL to scrape

### parse
The parsing workflow: a `pipe` function, an object or an array

### log
`log: true` turns on log output for debugging

### noRevisit
Set `true` to not revisit already visited pages

### options
```typescript
    options: {
        browser: {
            headless: false
        }
    }
```


## API

### pipe
```typescript
pipe(...args: any[])
```
Receives a set of functions and invoke them from left to right supplying the return value of the previous as input for the next. If an argument is not a function, it is converted to one (by `indentity`).    
For objects and arrays _all of their items/properties are also parsed_.    
If the return value is an `array`, _the rest of the function chain will be invoked for all of its items_.

### open
Opens a given or root url

### $ / $$
```typescript
$(selector: string|string[])
$$(selector: string|string[])
```
Calls `querySelector` / `querySelectorAll` on page/element.     
If an array of selectors is passed, uses the first one that exists. It is useful if data may be in various places of the DOM.

### attr(name: string)
Returns an element's property value 

### text
Returns a text content of an element

### save
```typescript
save({dir='files'}: {dir: string, saveAs?: (name: string, ext: string) => string})
```
Saves a link to a file and returns the file name.   
`saveAs` allows to modify a saved file name or extension.

### type(inputSelector: string, text: string, delay = 0)
Types text into an input

### select(selectSelector: string, ...values: string[])
Selects one or more values in a select

### enter(inputSelector: string, text: string, delay = 0)
Types text into an input and presses enter

