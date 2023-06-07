import { LaunchOptions, BrowserLaunchArgumentOptions, BrowserConnectOptions, launch } from 'puppeteer'
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
        browser: LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions
    }
}


export async function scrape(config: Config) {
    const browser = await launch({ headless: "new", ...config.options?.browser })
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