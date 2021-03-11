import puppeteer from 'puppeteer'
import { saveOutput, createWriteStream } from './saveOutput'
import path from 'path'
import { pipe } from './pipe'



export interface Config
{
    root?: string
    save?: string|Console
    log?: boolean
    parse: any
    options: {
        browser: puppeteer.LaunchOptions & puppeteer.ChromeArgOptions & puppeteer.BrowserOptions
    }
}


export async function scrape(config: Config) {
    const browser = await puppeteer.launch(config.options?.browser || {})
    global.scrapyteer = { 
        rootURL: config.root, 
        browser,
        log: config.log || false
    }

    await saveOutput(
        createWriteStream(config.save), 
        typeof config['save'] == 'string' ? path.extname(config.save as string).toLowerCase() : 'json',
        await pipe(config.parse)()
    )

    await browser.close()
}