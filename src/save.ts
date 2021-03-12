import path from 'path'
import fs from 'fs'
import { ElementHandle } from 'puppeteer'
import { composeURL } from './open'
import { attr } from './property'
import { log } from './log'



interface SaveOptions {
    dir?: string
    saveAs?: (fname: string, ext: string) => string
}

export function save({dir = 'files', saveAs = (nm,ext) => nm+ext}: SaveOptions = {}): (link: string|ElementHandle) => Promise<string> {
    return async (link: string|ElementHandle): Promise<string> => {
        return new Promise(async resolve => {
            const page = await global.scrapyteer.browser.newPage()
            const url = composeURL(await getLink(link))
            page.on('response', async response => {
                const fname = saveAs(path.basename(response.url(), path.extname(response.url())), path.extname(response.url()))
                const fpath = path.resolve(__dirname, dir, fname)
                fs.mkdirSync(path.dirname(fpath), { recursive: true })
                fs.writeFileSync(fpath, await response.buffer(), { flag: 'w' })
                log('save', url, '→', fpath)
                await page.close()
                resolve(fname)
            })
            await page.goto(url)
        })
    }
}

async function getLink(link: string|ElementHandle): Promise<string> {
    if (typeof link === 'string') {
        return link
    }
    if (typeof link['getProperty'] === 'function') {
        switch ((await attr('tagName', link)).toString().toUpperCase()) {
            case 'IMG': return await attr('src', link)
            case 'A': return await attr('href', link)
        }    
    }
    return ''+link
}