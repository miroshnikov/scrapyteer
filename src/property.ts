import R from 'ramda'
import { ElementHandle } from 'puppeteer'


export const attr = R.curry(
    async (name: string, element: ElementHandle): Promise<any> => await (await element.getProperty(name)).jsonValue()
)

export const text = async (element: ElementHandle): Promise<string> => await (await element.getProperty('textContent')).jsonValue() as string