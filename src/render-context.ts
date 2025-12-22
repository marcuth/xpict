import sharp from "sharp"

export type RenderContext = {
    image: sharp.Sharp
    offsetX: number
    offsetY: number
}   