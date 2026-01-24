import { SKRSContext2D } from "@napi-rs/canvas"

export type RenderContext = {
    ctx: SKRSContext2D
    offsetX: number
    offsetY: number
}
