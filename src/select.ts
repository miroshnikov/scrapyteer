import { Page } from 'puppeteer'


export function select(selector: string, ...values: string[]): (page: Page) => Promise<Page> {
    return async (page: Page) => {
        const el = await page.$(selector)
        if (el) {
            await el.select(...values)
        }
        return page
    }
}
