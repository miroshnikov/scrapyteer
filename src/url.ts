import { Page } from 'puppeteer'


export function url(page: Page): string {
    return page.url()
}
