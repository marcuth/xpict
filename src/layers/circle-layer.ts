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

    async render({ context: renderContext, data, index = 0, templateConfig }: RenderOptions<Data>): Promise<void> {
        const x =
            renderContext.offsetX +
            resolveAxis<Data>({
                axis: this.options.x,
                data: data,
                index: index,
                templateConfig: templateConfig,
            })

        const y =
            renderContext.offsetY +
            resolveAxis<Data>({
                axis: this.options.y,
                data: data,
                index: index,
                templateConfig: templateConfig,
            })

        const { radius, fill } = this.options

        const context = renderContext.ctx

        context.beginPath()
        context.arc(x, y, radius, 0, Math.PI * 2)
        context.closePath()
        context.fillStyle = fill
        context.fill()
    }
}
