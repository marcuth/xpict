import sharp, { Color } from "sharp"

import { commitFrame } from "./utils/commit-frame"
import { RenderContext } from "./render-context"
import { Layer } from "./layers/layer"

export type TemplateConfig = {
    width: number
    height: number
    fill?: Color
}

export type TemplateOptions<Data> = {
    imagePath: undefined
    config: TemplateConfig
    layers: Layer<Data>[]
} | {
    config: undefined
    imagePath: string
    layers: Layer<Data>[]
}

export class Template<Data> {
    constructor(public readonly options: TemplateOptions<Data>) {}

    async render(data: Data): Promise<sharp.Sharp> {
        let image: sharp.Sharp

        if (this.options.config) {
            const { width, height, fill } = this.options.config

            image = sharp({
                create: {
                    width: width,
                    height: height,
                    channels: 4,
                    background: fill ?? {
                        r: 0,
                        g: 0,
                        b: 0,
                        alpha: 0
                    }
                }
            })
        } else {
            image = sharp(this.options.imagePath)
        }

        const ctx: RenderContext = {
            image: image,
            offsetX: 0,
            offsetY: 0
        }

        for (const layer of this.options.layers) {
            if (!layer.shouldRender(data)) continue
            await layer.render(ctx, data)
            ctx.image = await commitFrame(ctx.image)
        }

        return ctx.image
    }
}