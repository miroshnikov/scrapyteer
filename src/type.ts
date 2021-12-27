import { Page } from 'puppeteer'


export function type(selector: string, text: string, delay = 0): (page: Page) => Promise<Page> {
    return async (page: Page) => {
        const el = await page.$(selector)
        if (el) {
            await el.type(text, {delay})
        }
        return page
    }
}
