import { FontOptions } from "../layers/text-layer"

export type FontConfigOptions = {
    color?: string
    name?: string
    filePath?: string
}

export type PartialFontOptions = {
    size: number
    color?: string
}

export function fontConfig(options: FontConfigOptions) {
    return (partialOptions: PartialFontOptions): FontOptions => {
        return {
            ...options,
            ...partialOptions
        }
    }
}