import { GlobalFonts } from "@napi-rs/canvas"

import fs from "node:fs"

export type FontOptions = {
    size: number
    color?: string
    name?: string
    filePath?: string
    weight?: string
}

export type FontConfigOptions = {
    color?: string
    name: string
    filePath?: string
    weight?: string
}

export type PartialFontOptions = {
    size: number
    color?: string
    weight?: string
}

export type Font = Omit<FontOptions, "filePath">

export function font(options: FontConfigOptions) {
    if (options.filePath) {
        const buffer = fs.readFileSync(options.filePath)
        GlobalFonts.register(buffer, options.name)
    }

    return (partialOptions: PartialFontOptions): Font => {
        const { filePath: _, ...rest } = {
            ...options,
            ...partialOptions,
        }

        return rest
    }
}
