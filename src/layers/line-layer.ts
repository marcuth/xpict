import { createCanvas } from "canvas"

import { Layer, RenderOptions, WhenFunction } from "./layer"
import { Axis, resolveAxis } from "../utils/resolve-axis"

export type LineLayerOptions<Data> = {
    from: {
        x: Axis<Data>
        y: Axis<Data>
    }
    to: {
        x: Axis<Data>
        y: Axis<Data>
    }
    color: string
    width: number
    when?: WhenFunction<Data>
}

export class LineLayer<Data> extends Layer<Data> {
    constructor(private readonly options: LineLayerOptions<Data>) {
        super(options.when)
    }

    async render({ context: ctx, data, index = 0, templateConfig }: RenderOptions<Data>): Promise<void> {
        const image = ctx.image
        const metadata = await image.metadata()

        const canvasWidth = metadata.width!
        const canvasHeight = metadata.height!

        const x1 =
            ctx.offsetX +
            resolveAxis<Data>({
                axis: this.options.from.x,
                data: data,
                index: index,
                templateConfig: templateConfig,
            })

        const y1 =
            ctx.offsetY +
            resolveAxis<Data>({
                axis: this.options.from.y,
                data: data,
                index: index,
                templateConfig: templateConfig,
            })

        const x2 =
            ctx.offsetX +
            resolveAxis<Data>({
                axis: this.options.to.x,
                data: data,
                index: index,
                templateConfig: templateConfig,
            })

        const y2 =
            ctx.offsetY +
            resolveAxis<Data>({
                axis: this.options.to.y,
                data: data,
                index: index,
                templateConfig: templateConfig,
            })

        const canvas = createCanvas(canvasWidth, canvasHeight)
        const context = canvas.getContext("2d")

        context.strokeStyle = this.options.color
        context.lineWidth = this.options.width
        context.lineCap = "round"

        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()

        const lineBuffer = canvas.toBuffer()

        ctx.image = image.composite([
            {
                input: lineBuffer,
                top: 0,
                left: 0,
            },
        ])
    }
}
