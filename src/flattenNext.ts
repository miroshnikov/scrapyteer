import { isIterable } from './isIterable'

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
