import { RenderContext } from "../render-context"

export abstract class Layer<Data = any> {
    constructor(
        protected readonly when?: (data: Data, index?: number) => boolean
    ) {}

    shouldRender(data: Data, index = 0): boolean {
        return this.when ? this.when(data, index) : true
    }

    abstract render(
        ctx: RenderContext,
        data: Data,
        index?: number
    ): Promise<void>
}
