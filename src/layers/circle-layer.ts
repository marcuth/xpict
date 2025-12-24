import { createCanvas } from "canvas"

import { Layer, RenderOptions, WhenOptions } from "./layer"
import { Axis, resolveAxis } from "../utils/resolve-axis"

export type CircleLayerOptions<Data> = {
    x: Axis<Data>
    y: Axis<Data>
    radius: number
    fill: string
    when?: (options: WhenOptions<Data>) => boolean
}

export class CircleLayer<Data> extends Layer<Data> {
    constructor(private readonly options: CircleLayerOptions<Data>) {
        super(options.when)
    }

    async render({ context: ctx, data, index = 0, templateConfig }: RenderOptions<Data>): Promise<void> {
        const image = ctx.image
        const metadata = await image.metadata()

        const canvasWidth = metadata.width!
        const canvasHeight = metadata.height!

        const x =
            ctx.offsetX +
            resolveAxis<Data>({
                axis: this.options.x,
                data: data,
                index: index,
                templateConfig: templateConfig,
            })

        const y =
            ctx.offsetY +
            resolveAxis<Data>({
                axis: this.options.y,
                data: data,
                index: index,
                templateConfig: templateConfig,
            })

        const { radius, fill } = this.options

        const canvas = createCanvas(canvasWidth, canvasHeight)
        const context = canvas.getContext("2d")

        context.beginPath()
        context.arc(x, y, radius, 0, Math.PI * 2)
        context.closePath()
        context.fillStyle = fill
        context.fill()

        const circleBuffer = canvas.toBuffer()

        ctx.image = image.composite([
            {
                input: circleBuffer,
                top: 0,
                left: 0,
            },
        ])
    }
}
