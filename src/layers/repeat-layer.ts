import { Layer, RenderOptions, WhenFunction } from "./layer"
import { Axis, resolveAxis } from "../utils/resolve-axis"

export type EachOptions<Data> = {
    data: Data
    index: number
}

export type EachFunction<Data, Item> = (options: EachOptions<Data>) => Item[]

export type LayerFunctionOptions = {
    index: number
    length: number
}

export type LayerFunction<Data, Item> = (item: Item, options: LayerFunctionOptions) => Layer<Data>

export type RepeatLayerOptions<Data, Item> = {
    each: EachFunction<Data, Item>
    layer: LayerFunction<Data, Item>
    when?: WhenFunction<Data>
    x: Axis<Data>
    y: Axis<Data>
}

export class RepeatLayer<Data, Item> extends Layer<Data> {
    constructor(private readonly options: RepeatLayerOptions<Data, Item>) {
        super(options.when)
    }

    async render({ context: ctx, data, index = 0, templateConfig }: RenderOptions<Data>): Promise<void> {
        const items = this.options.each({ data: data, index: index })

        if (!items || items.length === 0) return

        for (let index = 0; index < items.length; index++) {
            const item = items[index]

            const dx = resolveAxis<Data>({
                axis: this.options.x,
                data: data,
                index: index,
                templateSize: templateConfig,
            })

            const dy = resolveAxis<Data>({
                axis: this.options.y,
                data: data,
                index: index,
                templateSize: templateConfig,
            })

            const prevX = ctx.offsetX
            const prevY = ctx.offsetY

            ctx.offsetX += dx
            ctx.offsetY += dy

            const layer = this.options.layer(item, { index: index, length: items.length })

            await layer.render({
                context: ctx,
                data: data,
                index: index,
                templateConfig: templateConfig,
            })

            ctx.offsetX = prevX
            ctx.offsetY = prevY
        }
    }
}
