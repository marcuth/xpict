import { Canvas, createCanvas } from "@napi-rs/canvas"

export const RED = [255, 0, 0, 255]
export const BLANK = [0, 0, 0, 0]

export const pixel = (canvas: Canvas, x: number, y: number) =>
    Array.from(canvas.getContext("2d").getImageData(x, y, 1, 1).data)

export function solidPng(width: number, height: number, color = "#ff0000"): Buffer {
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = color
    ctx.fillRect(0, 0, width, height)
    return canvas.toBuffer("image/png")
}
