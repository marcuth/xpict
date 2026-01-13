import sharp from "sharp"

import { Layer, RenderOptions, WhenFunction } from "./layer"
import { Axis, resolveAxis } from "../utils/resolve-axis"
import { XpictError } from "../error"

export type TransformOptions<Data> = {
    data: Data
    index: number
    image: sharp.Sharp
}

export type ImageTransformFunction<Data> = (options: TransformOptions<Data>) => sharp.Sharp | Promise<sharp.Sharp>

export type ImageImageSrcOptions<Data> = {
    data: Data
    index: number
}

export type ImageSrcFunction<Data> = (options: ImageImageSrcOptions<Data>) => string | Buffer

export type ImageLayerOptions<Data> = {
    src: string | ImageSrcFunction<Data>
    x: Axis<Data>
    y: Axis<Data>
    width?: number
    height?: number
    flipX?: boolean
    flipY?: boolean
    rotate?: number
    when?: WhenFunction<Data>
    transform?: ImageTransformFunction<Data>[]
}

export class ImageLayer<Data> extends Layer<Data> {
    constructor(private options: ImageLayerOptions<Data>) {
        super(options.when)
    }

    async render({ context: ctx, data, index = 0, templateConfig }: RenderOptions<Data>) {
        const localX = resolveAxis<Data>({
            axis: this.options.x,
            data: data,
            index: index,
            templateConfig: templateConfig,
        })

        const localY = resolveAxis<Data>({
            axis: this.options.y,
            data: data,
            index: index,
            templateConfig: templateConfig,
        })

        const x = ctx.offsetX + localX
        const y = ctx.offsetY + localY

        const src = this.options.src
        const resolvedImageSource = typeof src === "string" ? src : src({ data: data, index: index })

        try {
            let img = sharp(resolvedImageSource).resize(this.options.width, this.options.height)

            if (this.options.flipX) {
                img = img.flop()
            }

            if (this.options.flipY) {
                img = img.flip()
            }

            if (this.options.rotate !== undefined) {
                img = img.rotate(this.options.rotate, {
                    background: { r: 0, g: 0, b: 0, alpha: 0 },
                })
            }

            if (this.options.transform && this.options.transform.length > 0) {
                for (const transform of this.options.transform) {
                    img = await transform({
                        data: data,
                        index: index,
                        image: img,
                    })
                }
            }

            const buffer = await img.toBuffer()

            ctx.image = ctx.image.composite([{ input: buffer, left: x, top: y }])
        } catch (error: any) {
            throw new XpictError(`Failed to render image layer (${resolvedImageSource}): ${error.message}`)
        }
    }
}
