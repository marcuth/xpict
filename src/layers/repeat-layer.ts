import { Axis, resolveAxis } from "../utils/resolve-axis"
import { commitFrame } from "../utils/commit-frame"
import { RenderContext } from "../render-context"
import { Layer } from "./layer"

export type RepeatLayerOptions<Data, Item> = {
    each: (data: Data) => Item[]
    layer: (item: Item, index: number) => Layer<Data>
    when?: (data: Data) => boolean
    x: Axis<Data>
    y: Axis<Data>
}

export class RepeatLayer<Data, Item> extends Layer<Data> {
    constructor(
        private readonly options: RepeatLayerOptions<Data, Item>,        
    ) {
        super(options.when)
    }

    async render(ctx: RenderContext, data: Data): Promise<void> {
        const items = this.options.each(data)

        if (!items || items.length === 0) return

        for (let index = 0; index < items.length; index++) {
            const item = items[index]

            const dx = resolveAxis<Data>(this.options.x, data, index)
            const dy = resolveAxis<Data>(this.options.y, data, index)

            const prevX = ctx.offsetX
            const prevY = ctx.offsetY

            ctx.offsetX += dx
            ctx.offsetY += dy

            const layer = this.options.layer(item, index)
            await layer.render(ctx, data, index)

            ctx.image = await commitFrame(ctx.image)
            ctx.offsetX = prevX
            ctx.offsetY = prevY
        }
    }
}
