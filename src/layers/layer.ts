import { RenderContext } from "../render-context"
import { TemplateConfig } from "../template"

export type WhenOptions<Data> = {
    data: Data
    index: number
}

export type WhenFunction<Data> = (options: WhenOptions<Data>) => boolean

export type RenderOptions<Data> = {
    context: RenderContext
    data: Data
    index?: number
    templateConfig: TemplateConfig
}

export abstract class Layer<Data = any> {
    constructor(protected readonly when?: WhenFunction<Data>) {}

    shouldRender(data: Data, index = 0): boolean {
        return this.when ? this.when({ data, index }) : true
    }

    abstract render(options: RenderOptions<Data>): Promise<void>
}
