import { ElementHandle, Page, WaitForOptions } from 'puppeteer'
import { isIterable } from './isIterable'
import { attr, text } from './property'
import { log } from './log'



export function open(options: WaitForOptions & { referer?: string } = {}): (link: string|ElementHandle) => Promise<(f: (page: Page) => any) => any>  {
    return async (link: string|ElementHandle = '/'): Promise<(f: (page: Page) => any) => any> => {
        const page = await global.scrapyteer.browser.newPage()
        let url = ''
        if (typeof link === 'string') {
            url = link 
        } else {
            const tag = (await attr('tagName', link)).toString().toUpperCase()
            url = tag == 'A' ? await attr('href', link) : await text(link)
        }
        url = composeURL(url) 
        if (global.scrapyteer.visited) {
            if (global.scrapyteer.visited.has(url)) {
                return null
            }
            global.scrapyteer.visited.add(url)
        }
        return async f => {
            log('open', url)
            await page.goto(url, options)
            const res = await f(page)
            if (isIterable(res)) {
                const it = typeof res[Symbol.asyncIterator] === 'function' ? res[Symbol.asyncIterator]() : res[Symbol.iterator]()
                return {
                    next: async () => {
                        const {done, value} = await it.next()
                        if (done) {
                            log('close', url)
                            await page.close() 
                        }
                        return {done, value}
                    },
                    [Symbol.asyncIterator]: function() { return this }
                }
            } else {
                log('close', url)
                await page.close()    
            }
            return res
        }
    }
}

export function composeURL(url: string): string {
    return url.startsWith('http') ? url : global.scrapyteer.rootURL + url
}
