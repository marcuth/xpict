import sharp, { Color } from "sharp"

import { commitFrame } from "./utils/commit-frame"
import { RenderContext } from "./render-context"
import { Layer } from "./layers/layer"

export type TemplateConfig = {
    width: number
    height: number
    fill?: Color
}

export type InputTemplateOptions<Data> =
    | {
          imagePath?: undefined
          config: TemplateConfig
          layers: Layer<Data>[]
      }
    | {
          config?: undefined
          imagePath: string
          layers: Layer<Data>[]
      }

export type TemplateOptions<Data> = {
    imagePath?: string
    config?: TemplateConfig
    layers: Layer<Data>[]
}

const transparentFill = {
    r: 0,
    g: 0,
    b: 0,
    alpha: 0,
}

export class Template<Data> {
    readonly options: TemplateOptions<Data>

    constructor(options: InputTemplateOptions<Data>) {
        this.options = options
    }

    async render(data: Data): Promise<sharp.Sharp> {
        let image: sharp.Sharp

        if (this.options.config) {
            const { width, height, fill } = this.options.config

            image = sharp({
                create: {
                    width: width,
                    height: height,
                    channels: 4,
                    background: fill ?? transparentFill,
                },
            })
        } else {
            image = sharp(this.options.imagePath)
            const metadata = await image.metadata()

            this.options.config = {
                width: metadata.width,
                height: metadata.height,
            }
        }

        const ctx: RenderContext = {
            image: image,
            offsetX: 0,
            offsetY: 0,
        }

        for (const layer of this.options.layers) {
            if (!layer.shouldRender(data)) continue

            await layer.render({
                context: ctx,
                data: data,
                templateConfig: this.options.config,
            })

            ctx.image = await commitFrame(ctx.image)
        }

        return ctx.image
    }
}
