import R from 'ramda'
import { ElementHandle, Page } from 'puppeteer'
import { log } from './log'



export const $ = R.curry(
    async (selectors: string, page: Page): Promise<ElementHandle|null> => {
        const found = await page.$(selectors)
        log("$("+selectors+")", '→', found ? 'found' : 'not found')
        return found
    }
)

export const $$ = R.curry(
    async (selectors: string, page: Page): Promise<ElementHandle[]> => {
        const found = await page.$$(selectors)
        log("$$("+selectors+")", '→', found ? found.length : 0)
        return found
    }
)
