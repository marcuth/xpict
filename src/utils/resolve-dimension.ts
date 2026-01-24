import { TemplateSize } from "../template"

export type ComputeDimensionOptions<Data> = {
    data: Data
    index: number
    templateSize: TemplateSize
}

export type ComputeDimension<Data> = (options: ComputeDimensionOptions<Data>) => number

export type Dimension<Data> = ComputeDimension<Data> | number

export type ResolveDimensionOptions<Data> = ComputeDimensionOptions<Data> & {
    dimension: Dimension<Data>
}

export function resolveDimension<Data>({ dimension, ...params }: ResolveDimensionOptions<Data>): number {
    if (typeof dimension === "function") {
        return dimension(params)
    }

    return dimension
}
