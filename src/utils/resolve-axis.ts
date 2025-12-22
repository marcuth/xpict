export type ComputeAxis<Data> = (data: Data, index: number) => number

export type Axis<Data> = ComputeAxis<Data> | number

export function resolveAxis<Data>(axis: Axis<Data>, data: Data, index: number): number {
    if (typeof axis === "function") {
        return axis(data, index)
    }

    return axis
}