import R from 'ramda'
import { ElementHandle, Page } from 'puppeteer'
import { log } from './log'



export const $ = R.curry(
    async (selectors: string|string[], page: Page|ElementHandle): Promise<ElementHandle|null> => {
        if (!Array.isArray(selectors)) {
            selectors = [selectors]
        }
        for (const selector of selectors) {
            const found = await page.$(selector)
            log("$("+selector+")", '→', found ? 'found' : 'not found')
            if (found) {
                return found
            }
        }
        return null
    }
)

export const $$ = R.curry(
    async (selectors: string|string[], page: Page|ElementHandle): Promise<ElementHandle[]> => {
        if (!Array.isArray(selectors)) {
            selectors = [selectors]
        }
        for (const selector of selectors) {
            const found = await page.$$(selector)
            log("$$("+selector+")", '→', found ? found.length : 0)
            if (found.length) {
                return found
            }
        }
        return []
    }
)
