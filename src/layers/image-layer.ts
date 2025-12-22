import sharp from "sharp"

import { Axis, resolveAxis } from "../utils/resolve-axis"
import { RenderContext } from "../render-context"
import { Layer } from "./layer"

export type ImageLayerOptions<Data> = {
    src: (data: Data) => string | Buffer
    x: Axis<Data>
    y: Axis<Data>
    width?: number
    height?: number
    when?: (data: Data) => boolean
}

export class ImageLayer<Data> extends Layer<Data> {
    constructor(
        private options: ImageLayerOptions<Data>
    ) {
        super(options.when)
    }

    async render(ctx: RenderContext, data: Data) {
        const xValue = resolveAxis<Data>(this.options.x, data, 0)
        const yValue = resolveAxis<Data>(this.options.y, data, 0)

        const img = await sharp(this.options.src(data))
            .resize(this.options.width, this.options.height)
            .toBuffer() 

        ctx.image = ctx.image.composite([
            { input: img, left: xValue, top: yValue }
        ])
    }
}
