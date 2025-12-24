import { TemplateConfig } from "../template"

export type ComputeAxisOptions<Data> = {
    data: Data
    index: number
}

export type ComputeAxis<Data> = (options: ComputeAxisOptions<Data>) => number

export type Axis<Data> = ComputeAxis<Data> | number

export type ResolveAxisOptions<Data> = {
    axis: Axis<Data>
    data: Data
    index: number
    templateConfig: TemplateConfig
}

export function resolveAxis<Data>({ axis, ...params }: ResolveAxisOptions<Data>): number {
    if (typeof axis === "function") {
        return axis(params)
    }

    return axis
}
