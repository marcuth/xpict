import { Canvas, createCanvas, SKRSContext2D, loadImage } from "@napi-rs/canvas"

import { Layer, RenderOptions, WhenFunction } from "./layer"
import { Axis, resolveAxis } from "../utils/resolve-axis"
import { XpictError } from "../error"

export type TransformOptions<Data> = {
    data: Data
    index: number
    canvas: Canvas
    ctx: SKRSContext2D
}

export type ImageTransformFunction<Data> = (options: TransformOptions<Data>) => void | Promise<void>

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

    async render({ context: renderContext, data, index = 0, templateConfig }: RenderOptions<Data>) {
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

        const x = renderContext.offsetX + localX
        const y = renderContext.offsetY + localY

        const src = this.options.src
        const resolvedImageSource = typeof src === "string" ? src : src({ data: data, index: index })
        const image = await loadImage(resolvedImageSource)
        const localCanvas = createCanvas(image.width, image.height)
        const localContext = localCanvas.getContext("2d")

        try {
            localContext.drawImage(image, 0, 0)

            if (this.options.flipX) {
                localContext.translate(image.width, 0)
                localContext.scale(-1, 1)
            }

            if (this.options.flipY) {
                localContext.translate(0, image.height)
                localContext.scale(1, -1)
            }

            if (this.options.rotate !== undefined) {
                localContext.translate(image.width / 2, image.height / 2)
                localContext.rotate((this.options.rotate * Math.PI) / 180)
                localContext.translate(-image.width / 2, -image.height / 2)
            }

            if (this.options.transform && this.options.transform.length > 0) {
                for (const transform of this.options.transform) {
                    await transform({
                        data: data,
                        index: index,
                        canvas: localCanvas,
                        ctx: localContext,
                    })
                }
            }

            const buffer = localCanvas.toBuffer("image/png")
            const finalImage = await loadImage(buffer)

            renderContext.ctx.drawImage(finalImage, x, y)
        } catch (error: any) {
            throw new XpictError(`Failed to render image layer (${resolvedImageSource}): ${error.message}`)
        }
    }
}
