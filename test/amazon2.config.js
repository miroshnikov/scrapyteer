// const { pipe, open, select, enter, $$, $, text } = require('scrapyteer');
const { pipe, open, select, enter, $$, $, text, save  } = require('../dist/index.js');

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
            cover: pipe(                // save cover image as a file
                $(['#imageBlockContainer img', '#ebooks-main-image-container img']),     // try several selectors
                save({dir: 'cover-images'})
            )   
        }
    )
}
