import fs from 'fs'
import path from 'path'
import { isIterable } from './isIterable'
import { iteratorToArray } from './iteratorToArray'



interface WriteStream {
    write(...args: any[]): void, 
    close(): void
}

export enum OutputFormat
{
    JSON = '.json',
    JSONL = '.jsonl',
    CSV = '.csv'
}

export async function saveOutput(stream: WriteStream, fmt: OutputFormat, input: any) {
    if (fmt == OutputFormat.JSON) {
        stream.write(JSON.stringify(await iteratorToArray(input)))
    } else if (fmt == OutputFormat.JSONL) {
        if (!isIterable(input)) {
            throw new Error('Cannot save object that is not iterable as JSONL')
        }
        for await (const item of input) {
            if (item) {
                stream.write(JSON.stringify(await iteratorToArray(item)) + '\n')
            }
        } 
    }
    stream.close()
}

export function createWriteStream(fname?: string|Console): WriteStream {
    if (typeof fname?.['log'] === 'function') {
        return { write: (...args) => console.log(...args), close: () => {} }
    }
    const ext = getOutputFormat(fname)
    if (!Object.values(OutputFormat).includes(ext)) {
        throw new Error(`Invalid output file type '${ext}'`)
    }
    return fs.createWriteStream(path.resolve(__dirname, fname as string || 'output.json'), { flags: 'w' })
}

export function getOutputFormat(output?: string|Console): OutputFormat {
    return typeof output == 'string' ? path.extname(output as string).toLowerCase() as OutputFormat : OutputFormat.JSON
}
