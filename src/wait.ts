import { Page } from 'puppeteer'


export function wait(timeout: 100): (page: Page) => Promise<Page> {
    return async (page: Page) => {
        await page.waitForTimeout(timeout)
        return page
    }
}
