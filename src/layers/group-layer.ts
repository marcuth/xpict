import { Layer } from "./layer"

import { Axis, resolveAxis } from "../utils/resolve-axis"
import { commitFrame } from "../utils/commit-frame"
import { RenderContext } from "../render-context"

export type GroupLayerOptions<Data> = {
    layers: Layer<Data>[]
    x: Axis<Data>
    y: Axis<Data>
    when?: (data: Data) => boolean
}

export class GroupLayer<Data> extends Layer<Data> {
    constructor(
        private readonly options: GroupLayerOptions<Data>,
    ) {
        super(options.when)
    }

    async render(ctx: RenderContext, data: Data, index: number = 0) {
        const dx = resolveAxis<Data>(this.options.x, data, index)
        const dy = resolveAxis<Data>(this.options.y, data, index)

        const prevX = ctx.offsetX
        const prevY = ctx.offsetY

        ctx.offsetX += dx
        ctx.offsetY += dy

        for (const layer of this.options.layers) {
            if (!layer.shouldRender(data)) continue
            await layer.render(ctx, data, index)
            ctx.image = await commitFrame(ctx.image)
        }

        ctx.offsetX = prevX
        ctx.offsetY = prevY
    }
}