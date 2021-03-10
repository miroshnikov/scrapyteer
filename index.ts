import R from 'ramda'
import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer'
import fs from 'fs'
import path from 'path'



export interface Config
{
    root?: string
    save?: string|Console
    log?: boolean
    parse: any
}

declare global {
    namespace NodeJS {
        interface Global {
            scrapyteer: { 
                rootURL: string 
                browser: Browser,
                log: boolean
            }
        }
    }
}

export async function scrape(fname: string) {
    // path.resolve(__dirname, 'out.json')
}



export async function parse(config: Config) {
    const browser = await puppeteer.launch()
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

async function saveOutput(stream: { write: (...args: any[]) => void, close: () => void }, fmt: string, input: any) {
    if (!['.json','.jsonl','.csv'].includes(fmt)) {
        throw new Error('Invalid output file type '+fmt)
    }
    if (fmt == '.json') {
        stream.write(JSON.stringify(await iteratorToArray(input)))
    } else if (fmt == '.jsonl') {
        if (!isIterable(input)) {
            throw new Error('Cannot save object, that is not iterable as JSONL')
        }
        for await (const item of input) {
            stream.write(JSON.stringify(await iteratorToArray(item)) + '\n')
        } 
    }
    stream.close()
}

function createWriteStream(fname?: string|Console): { write: (...args) => void, close: () => void } {
    if (typeof fname?.['log'] === 'function') {
        return { write: (...args) => console.log(...args), close: () => {} }
    }
    return fs.createWriteStream(path.resolve(__dirname, fname as string || 'output.json'), { flags: 'w' })
}



export async function open(link: string|ElementHandle = '/'): Promise<(f: (page: Page) => any) => any> {
    const page = await global.scrapyteer.browser.newPage()
    let url = ''
    if (typeof link === 'string') {
        url = link 
    } else {
        const tag = (await attr('tagName', link)).toString().toUpperCase()
        url = tag == 'A' ? await attr('href', link) : await text(link)
    }
    url = composeURL(url) 
    return async f => {
        log('open', url)
        await page.goto(url)
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

function composeURL(url: string): string {
    return url.startsWith('http') ? url : global.scrapyteer.rootURL + url
}


export const $ = R.curry(
    async (selectors: string, page: Page): Promise<ElementHandle|null> => {
        const found = await page.$(selectors)
        log("$("+selectors+")", '→', found ? 'found' : 'not found')
        return found
    }
)

export const $$ = R.curry(
    async (selectors: string, page: Page): Promise<ElementHandle[]> => {
        const found = await page.$$(selectors)
        log("$$("+selectors+")", '→', found ? found.length : 0)
        return found
    }
)

export const attr = R.curry(
    async (name: string, element: ElementHandle): Promise<any> => await (await element.getProperty(name)).jsonValue()
)

export const text = async (element: ElementHandle): Promise<string> => await (await element.getProperty('textContent')).jsonValue() as string


export function pipe(...funcs: any[]): (...args: any[]) => Promise<any>|any {
    if (!funcs.length) {
        return (...args: any[]) => R.head(args)
    }
    const f = R.head(funcs)
    return async (...args: any[]) => {
        const arg = R.head(args)

        if (isIterable(arg)) {
            return applyIterable(arg, funcs)
        }

        if (typeof arg === 'function') {
            return await arg(pipe(...funcs))
        }

        if (args.length == 1 && R.isNil(arg)) {
            return null
        }

        if (typeof f === 'function') {
            return await pipe(...R.tail(funcs))(await f(...args))
        }
        if (R.type(f) === 'Object') {
            return await pipe(...R.tail(funcs))(await parseObject(f, ...args))
        }
        if (R.type(f) === 'Array') {
            return await pipe(...R.tail(funcs))(await parseArray(f, ...args))
        }
        return f
    }
}

// function async_pipe()

async function parseObject(object: Record<string, any>, ...args: any[]): Promise<Record<string, any>> {
    const res = {}
    for (const prop in object) {
        const v = await stringify( await pipe(object[prop])(...args) )
        res[prop] = await iteratorToArray(v)
    }
    return res
}

async function parseArray(array: any[], ...args: any[]) {
    const res = []
    for (let i=0; i<array.length; ++i) {
        res[i] = await pipe(array[i])(...args)
    }
    return res
}

function isIterable(obj: any): boolean {
    if (typeof obj !== 'object') {
        return false
    }
    return typeof obj[Symbol.iterator] === 'function' || typeof obj[Symbol.asyncIterator] === 'function'
}

function applyIterable(iterable: any, funcs: any[]): {} {
    return {
        async *[Symbol.asyncIterator] () {
            for (const item of iterable) {
                yield await stringify( await pipe(...funcs)(item) )
            }
        }
    }
}

// async function applyArray(array: any[], funcs: any[]) {
//     const res = []
//     for (let i=0; i<array.length; ++i) {
//         res[i] = await stringify( await pipe(...funcs)(array[i]) )
//     }
//     return res
// }

async function stringify(v: any): Promise<any> {
    if (typeof v === 'object' && typeof v['getProperty'] === 'function') {  //ElementHandle
        return await text(v)
    }
    return v
}



export function flattenNext(depth = 1) {
    return (...args: any[]): (f:Function) => Promise<any> =>
        async (f: Function) => recurseIterable(await f(...args), depth+1)
}

async function* recurseIterable(iterable, depth: number) {   
    if (isIterable(iterable) && depth) {
        for await (const item of iterable) {
            yield* recurseIterable(item, depth-1)
        }
    } else {
        yield iterable
    }
}



function log(...args: any[]) {
    if (global.scrapyteer.log) {
        console.log(...args)
    }
}



export const dump = R.tap(arg => console.log(arg))



export async function iteratorToArray(iterable): Promise<any> { 
    if (isIterable(iterable)) {
        const arr = []
        for await (const item of iterable) {
            arr.push(await iteratorToArray(item))
        } 
        return arr        
    }
    return iterable
}

