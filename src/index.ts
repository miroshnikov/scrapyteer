import R from 'ramda'
import { Browser } from 'puppeteer'



declare global {
    namespace NodeJS {
        interface Global {
            scrapyteer: { 
                rootURL: string 
                browser: Browser,
                log: boolean
            }
        }
    }
}

export const dump = R.tap(arg => console.log(arg))


export { pipe } from './pipe'
export { open } from './open'
export { $, $$ } from './select'
export { attr, text } from './property'
export { flattenNext } from './flattenNext'
export { iteratorToArray } from './iteratorToArray'
export { scrape } from './scrape'