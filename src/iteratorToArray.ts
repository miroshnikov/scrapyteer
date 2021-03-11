import { isIterable } from './isIterable'
import { text } from './property'



export async function iteratorToArray(iterable): Promise<any> { 
    if (isIterable(iterable)) {
        const arr = []
        for await (const item of iterable) {
            if (item) {
                arr.push(await stringify(await iteratorToArray(item)))
            }
        } 
        return arr        
    }
    return stringify(iterable)
}

async function stringify(v: any): Promise<any> {
    if (v && typeof v === 'object' && typeof v['getProperty'] === 'function') {  //ElementHandle
        return await text(v)
    }
    return v
}
