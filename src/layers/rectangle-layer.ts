import { createCanvas } from "canvas"

import { Layer, RenderOptions, WhenFunction } from "./layer"
import { Axis, resolveAxis } from "../utils/resolve-axis"

export type RectangleLayerOptions<Data> = {
    x: Axis<Data>
    y: Axis<Data>
    width: number
    height: number
    fill: string
    borderRadius?: number
}

export class RectangleLayer<Data> extends Layer<Data> {
    constructor(
        private readonly options: RectangleLayerOptions<Data>,
        when?: WhenFunction<Data>,
    ) {
        super(when)
    }

    async render({ context: ctx, data, index = 0, templateConfig }: RenderOptions<Data>): Promise<void> {
        const image = ctx.image
        const metadata = await image.metadata()

        const canvasWidth = metadata.width
        const canvasHeight = metadata.height

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

        const { width, height, fill, borderRadius } = this.options

        const canvas = createCanvas(canvasWidth, canvasHeight)
        const context = canvas.getContext("2d")

        context.fillStyle = fill

        if (borderRadius && borderRadius > 0) {
            const r = Math.min(borderRadius, width / 2, height / 2)

            context.beginPath()
            context.moveTo(x + r, y)
            context.lineTo(x + width - r, y)
            context.arcTo(x + width, y, x + width, y + height, r)
            context.lineTo(x + width, y + height - r)
            context.arcTo(x + width, y + height, x, y + height, r)
            context.lineTo(x + r, y + height)
            context.arcTo(x, y + height, x, y, r)
            context.lineTo(x, y + r)
            context.arcTo(x, y, x + width, y, r)
            context.closePath()
            context.fill()
        } else {
            context.fillRect(x, y, width, height)
        }

        const rectangleBuffer = canvas.toBuffer()

        ctx.image = image.composite([
            {
                input: rectangleBuffer,
                top: 0,
                left: 0,
            },
        ])
    }
}
