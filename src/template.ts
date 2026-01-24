import { Canvas, createCanvas, loadImage } from "@napi-rs/canvas"

import { RenderContext } from "./render-context"
import { Layer } from "./layers/layer"
import { XpictError } from "./error"

export type TemplateSize = {
    width: number
    height: number
}

export type TemplateConfig = TemplateSize & {
    fill?: string
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

export class Template<Data> {
    readonly options: TemplateOptions<Data>

    constructor(options: InputTemplateOptions<Data>) {
        this.options = options
    }

    async render(data: Data): Promise<Canvas> {
        let canvas: Canvas

        if (this.options.config) {
            const { width, height, fill } = this.options.config
            canvas = createCanvas(width, height)

            if (fill) {
                const ctx = canvas.getContext("2d")
                ctx.fillStyle = fill
                ctx.fillRect(0, 0, width, height)
            }
        } else if (this.options.imagePath) {
            const backgroundImage = await loadImage(this.options.imagePath)
            canvas = createCanvas(backgroundImage.width, backgroundImage.height)

            this.options.config = {
                width: backgroundImage.width,
                height: backgroundImage.height,
            }
        } else {
            throw new XpictError("No config or imagePath provided")
        }

        const ctx = canvas.getContext("2d")

        const renderContext: RenderContext = {
            ctx: ctx,
            offsetX: 0,
            offsetY: 0,
        }

        for (const layer of this.options.layers) {
            if (!layer.shouldRender(data)) continue

            await layer.render({
                context: renderContext,
                data: data,
                templateConfig: this.options.config,
            })
        }

        return canvas
    }
}
