import R from 'ramda'
import { Browser } from 'puppeteer'



declare global {
    namespace NodeJS {
        interface Global {
            scrapyteer: { 
                rootURL: string 
                browser: Browser,
                log: boolean,
                visited: Set<string>
            }
        }
    }
}


export { pipe } from './pipe'
export { open } from './open'
export { $, $$ } from './query'
export { attr, text } from './property'
export { save } from './save'
export { select } from './select'
export { type } from './type'
export { press } from './press'
export { enter } from './enter'
export { url } from './url'
export { wait } from './wait'
export { flattenNext } from './flattenNext'
export { iteratorToArray } from './iteratorToArray'
export { scrape } from './scrape'


export function tap(f: (...args: any[]) => void|Promise<void>): (...args: any[]) => Promise<any> {
    return async (...args: any[]) => {
        await f(...args)
        return R.head(args)
    }
}


export function dump(s = '') {
    return tap((...args) => s ? console.log(s, ...args) : console.log(...args))
}