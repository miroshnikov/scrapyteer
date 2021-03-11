export function isIterable(obj: any): boolean {
    if (typeof obj !== 'object') {
        return false
    }
    return typeof obj[Symbol.iterator] === 'function' || typeof obj[Symbol.asyncIterator] === 'function'
}
