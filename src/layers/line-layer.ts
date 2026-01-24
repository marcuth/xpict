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

    async render({ context: renderContext, data, index = 0, templateConfig }: RenderOptions<Data>): Promise<void> {
        const x1 =
            renderContext.offsetX +
            resolveAxis<Data>({
                axis: this.options.from.x,
                data: data,
                index: index,
                templateSize: templateConfig,
            })

        const y1 =
            renderContext.offsetY +
            resolveAxis<Data>({
                axis: this.options.from.y,
                data: data,
                index: index,
                templateSize: templateConfig,
            })

        const x2 =
            renderContext.offsetX +
            resolveAxis<Data>({
                axis: this.options.to.x,
                data: data,
                index: index,
                templateSize: templateConfig,
            })

        const y2 =
            renderContext.offsetY +
            resolveAxis<Data>({
                axis: this.options.to.y,
                data: data,
                index: index,
                templateSize: templateConfig,
            })

        const context = renderContext.ctx

        context.strokeStyle = this.options.color
        context.lineWidth = this.options.width
        context.lineCap = "round"

        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }
}
