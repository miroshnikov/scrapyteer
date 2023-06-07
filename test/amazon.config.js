// const { pipe, open, select, enter, $$, $, text } = require('scrapyteer');
const { pipe, open, select, enter, $$, $, text } = require('../dist/index.js');

module.exports = {
    root: 'https://www.amazon.com',
    parse: pipe(
        open(),     // open amazon.com
        select('#searchDropdownBox', 'search-alias=stripbooks-intl-ship'),  // select 'Books' in dropdown
        enter('#twotabsearchtextbox', 'Web scraping'),   // enter search phrase
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