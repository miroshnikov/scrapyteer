import { isIterable } from './isIterable'


export async function iteratorToArray(iterable): Promise<any> { 
    if (isIterable(iterable)) {
        const arr = []
        for await (const item of iterable) {
            if (item) {
                arr.push(await iteratorToArray(item))
            }
        } 
        return arr        
    }
    return iterable
}