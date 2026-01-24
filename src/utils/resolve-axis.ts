import { TemplateSize } from "../template"

export type ComputeAxisOptions<Data> = {
    data: Data
    index: number
    templateSize: TemplateSize
}

export type ComputeAxis<Data> = (options: ComputeAxisOptions<Data>) => number

export type Axis<Data> = ComputeAxis<Data> | number

export type ResolveAxisOptions<Data> = ComputeAxisOptions<Data> & {
    axis: Axis<Data>
}

export function resolveAxis<Data>({ axis, ...params }: ResolveAxisOptions<Data>): number {
    if (typeof axis === "function") {
        return axis(params)
    }

    return axis
}
