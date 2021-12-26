import puppeteer from 'puppeteer'
import { saveOutput, createWriteStream, getOutputFormat } from './saveOutput'
import { pipe } from './pipe'



export interface Config
{
    root?: string
    save?: string|Console
    parse: any
    log?: boolean
    noRevisit?: boolean
    options: {
        browser: puppeteer.LaunchOptions & puppeteer.ChromeArgOptions & puppeteer.BrowserOptions
    }
}


export async function scrape(config: Config) {
    const browser = await puppeteer.launch(config.options?.browser || {})
    global.scrapyteer = { 
        rootURL: config.root, 
        browser,
        log: config.log || false,
        visited: config.noRevisit ? new Set() : null
    }
    await saveOutput(
        createWriteStream(config.save), 
        getOutputFormat(config.save),
        await pipe(config.parse)()
    )

    await browser.close()
}