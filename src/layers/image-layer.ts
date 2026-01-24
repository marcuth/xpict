import { Canvas, createCanvas, SKRSContext2D, loadImage } from "@napi-rs/canvas"

import { Dimension, resolveDimension } from "../utils/resolve-dimension"
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
    width?: Dimension<Data>
    height?: Dimension<Data>
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
            templateSize: templateConfig,
        })

        const localY = resolveAxis<Data>({
            axis: this.options.y,
            data: data,
            index: index,
            templateSize: templateConfig,
        })

        const width = this.options.width
            ? resolveDimension<Data>({
                  data: data,
                  dimension: this.options.width,
                  index: index,
                  templateSize: templateConfig,
              })
            : this.options.width

        const height = this.options.height
            ? resolveDimension<Data>({
                  data: data,
                  dimension: this.options.height,
                  index: index,
                  templateSize: templateConfig,
              })
            : this.options.height

        const x = renderContext.offsetX + localX
        const y = renderContext.offsetY + localY

        const src = this.options.src
        const resolvedImageSource = typeof src === "string" ? src : src({ data: data, index: index })
        const image = await loadImage(resolvedImageSource)

        let finalWidth: number
        let finalHeight: number

        if (width && height) {
            finalWidth = width
            finalHeight = height
        } else if (width) {
            finalWidth = width
            finalHeight = (width / image.width) * image.height
        } else if (height) {
            finalHeight = height
            finalWidth = (height / image.height) * image.width
        } else {
            finalWidth = image.width
            finalHeight = image.height
        }

        const localCanvas = createCanvas(finalWidth, finalHeight)
        const localContext = localCanvas.getContext("2d")

        try {
            const hasRotaion = this.options.flipX || this.options.flipY || this.options.rotate !== undefined

            if (hasRotaion) {
                localContext.translate(finalWidth / 2, finalHeight / 2)

                if (this.options.rotate !== undefined) {
                    localContext.rotate((this.options.rotate * Math.PI) / 180)
                }

                const scaleX = this.options.flipX ? -1 : 1
                const scaleY = this.options.flipY ? -1 : 1
                localContext.scale(scaleX, scaleY)

                localContext.translate(-finalWidth / 2, -finalHeight / 2)
            }

            localContext.drawImage(image, 0, 0, finalWidth, finalHeight)

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

            localContext.restore()

            const buffer = localCanvas.toBuffer("image/png")
            const finalImage = await loadImage(buffer)

            renderContext.ctx.drawImage(finalImage, x, y)
        } catch (error: any) {
            throw new XpictError(`Failed to render image layer (${resolvedImageSource}): ${error.message}`)
        }
    }
}
