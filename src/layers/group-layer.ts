import { Layer, RenderOptions, WhenOptions } from "./layer"

import { Axis, resolveAxis } from "../utils/resolve-axis"
import { commitFrame } from "../utils/commit-frame"

export type GroupLayerOptions<Data> = {
    layers: Layer<Data>[]
    x?: Axis<Data>
    y?: Axis<Data>
    when?: (options: WhenOptions<Data>) => boolean
}

export class GroupLayer<Data> extends Layer<Data> {
    constructor(private readonly options: GroupLayerOptions<Data>) {
        super(options.when)
    }

    async render({ context: ctx, data, index = 0, templateConfig }: RenderOptions<Data>) {
        const dx = resolveAxis<Data>({
            axis: this.options.x ?? 0,
            data: data,
            index: index,
            templateConfig: templateConfig,
        })

        const dy = resolveAxis<Data>({
            axis: this.options.y ?? 0,
            data: data,
            index: index,
            templateConfig: templateConfig,
        })

        const prevX = ctx.offsetX
        const prevY = ctx.offsetY

        ctx.offsetX += dx
        ctx.offsetY += dy

        for (const layer of this.options.layers) {
            if (!layer.shouldRender(data)) continue

            await layer.render({
                context: ctx,
                data: data,
                index: index,
                templateConfig: templateConfig,
            })

            ctx.image = await commitFrame(ctx.image)
        }

        ctx.offsetX = prevX
        ctx.offsetY = prevY
    }
}
