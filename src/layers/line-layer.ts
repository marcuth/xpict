import { createCanvas } from "canvas"

import { Axis, resolveAxis } from "../utils/resolve-axis"
import { RenderContext } from "../render-context"
import { Layer } from "./layer"

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
    when?: (data: Data, index?: number) => boolean
}

export class LineLayer<Data> extends Layer<Data> {
  constructor(
    private readonly options: LineLayerOptions<Data>,
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

    const x1 = ctx.offsetX + resolveAxis<Data>(this.options.from.x, data, index)
    const y1 = ctx.offsetY + resolveAxis<Data>(this.options.from.y, data, index)
    const x2 = ctx.offsetX + resolveAxis<Data>(this.options.to.x, data, index)
    const y2 = ctx.offsetY + resolveAxis<Data>(this.options.to.y, data, index)

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
            left: 0
        }
    ])
  }
}
