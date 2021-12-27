import R from 'ramda'
import { ElementHandle, Page } from 'puppeteer'
import { log } from './log'



export const $ = R.curry(
    async (selector: string, page: Page|ElementHandle): Promise<ElementHandle|null> => {
        const found = await page.$(selector)
        log("$("+selector+")", '→', found ? 'found' : 'not found')
        return found
    }
)

export const $$ = R.curry(
    async (selector: string, page: Page|ElementHandle): Promise<ElementHandle[]> => {
        const found = await page.$$(selector)
        log("$$("+selector+")", '→', found ? found.length : 0)
        return found
    }
)
