import { Page, KeyInput } from 'puppeteer'


export function press(selector: string, key: KeyInput, delay = 0): (page: Page) => Promise<Page> {
    return async (page: Page) => {
        const el = await page.$(selector)
        if (el) {
            await Promise.all([
                page.waitForNavigation(),
                el.press(key, {delay})
            ])
        }
        return page
    }
}
