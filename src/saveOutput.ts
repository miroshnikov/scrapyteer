import fs from 'fs'
import path from 'path'
import { isIterable } from './isIterable'
import {iteratorToArray } from './iteratorToArray'


export async function saveOutput(stream: { write: (...args: any[]) => void, close: () => void }, fmt: string, input: any) {
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
            if (item) {
                stream.write(JSON.stringify(await iteratorToArray(item)) + '\n')
            }
        } 
    }
    stream.close()
}

export function createWriteStream(fname?: string|Console): { write: (...args) => void, close: () => void } {
    if (typeof fname?.['log'] === 'function') {
        return { write: (...args) => console.log(...args), close: () => {} }
    }
    return fs.createWriteStream(path.resolve(__dirname, fname as string || 'output.json'), { flags: 'w' })
}