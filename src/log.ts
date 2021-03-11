export function log(...args: any[]) {
    if (global.scrapyteer.log) {
        console.log(...args)
    }
}
