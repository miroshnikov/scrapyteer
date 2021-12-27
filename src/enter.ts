import { Page } from 'puppeteer'
import { type } from './type'
import { press } from './press'


export function enter(selector: string, text: string, delay = 0): (page: Page) => Promise<Page> {
    return async (page: Page) => {
        await type(selector, text, delay)(page)
        await press(selector, 'Enter')(page)
        return page
    }
}
