import { createCanvas } from "canvas"

import { Axis, resolveAxis } from "../utils/resolve-axis"
import { RenderContext } from "../render-context"
import { Layer } from "./layer"

export type CircleLayerOptions<Data> = {
    x: Axis<Data>
    y: Axis<Data>
    radius: number
    fill: string
    when?: (data: Data, index?: number) => boolean
}

export class CircleLayer<Data> extends Layer<Data> {
    constructor(
        private readonly options: CircleLayerOptions<Data>,
    ) {
        super(options.when)
    }

    async render(
        ctx: RenderContext,
        data: Data,
        index: number = 0
    ): Promise<void> {
        const image = ctx.image
        const metadata = await image.metadata()

        const canvasWidth = metadata.width!
        const canvasHeight = metadata.height!

        const x = ctx.offsetX + resolveAxis<Data>(this.options.x, data, index)
        const y = ctx.offsetY + resolveAxis<Data>(this.options.y, data, index)

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
                left: 0
            }
        ])
    }
}