import { createCanvas, registerFont } from "canvas"

import { Axis, resolveAxis } from "../utils/resolve-axis"
import { RenderContext } from "../render-context"
import { Layer } from "./layer"

export type FontOptions = {
    size: number
    color?: string
    name?: string
    filePath?: string
}

export type TextAnchor =
    | "top-left" | "top-center" | "top-right"
    | "middle-left" | "middle-center" | "middle-right"
    | "bottom-left" | "bottom-center" | "bottom-right"

export type Stroke = {
    fill: string
    width: number
}

export type TextLayerOptions<Data> = {
    text: (data: Data) => string
    font: FontOptions
    x: Axis<Data>
    y: Axis<Data>
    backgroundColor?: string
    anchor?: TextAnchor
    stroke?: Stroke
    rotation?: number
    when?: (data: Data) => boolean
}

const anchorOffsets: Record<TextAnchor, (w: number, h: number) => { x: number; y: number }> = {
    "top-left": (w, h) => ({ x: 0, y: 0 }),
    "top-center": (w, h) => ({ x: -w / 2, y: 0 }),
    "top-right": (w, h) => ({ x: -w, y: 0 }),
    "middle-left": (w, h) => ({ x: 0, y: -h / 2 }),
    "middle-center": (w, h) => ({ x: -w / 2, y: -h / 2 }),
    "middle-right": (w, h) => ({ x: -w, y: -h / 2 }),
    "bottom-left": (w, h) => ({ x: 0, y: -h }),
    "bottom-center": (w, h) => ({ x: -w / 2, y: -h }),
    "bottom-right": (w, h) => ({ x: -w, y: -h })
}

export class TextLayer<Data> extends Layer<Data> {
    constructor(
        private readonly options: TextLayerOptions<Data>
    ) {
        super(options.when)
    }

    async render(ctx: RenderContext, data: Data): Promise<void> {
        const imageMetadata = await ctx.image.metadata()
        const width = imageMetadata.width!
        const height = imageMetadata.height!

        const {
            text,
            font,
            x: initialX,
            y: initialY,
            backgroundColor = "transparent",
            anchor = "top-left",
            stroke,
            rotation = 0
        } = this.options

        if (font.filePath) {
            registerFont(font.filePath, { family: font.name! })
        }

        const canvas = createCanvas(width, height)
        const context = canvas.getContext("2d")

        if (backgroundColor !== "transparent") {
            context.fillStyle = backgroundColor
            context.fillRect(0, 0, width, height)
        }

        context.font = `${font.size}px ${font.name ?? "Arial"}`
        context.fillStyle = font.color ?? "#000"

        const content = text(data)
        const metrics = context.measureText(content)
        const textWidth = metrics.width
        const textHeight = font.size

        const offset = anchorOffsets[anchor](textWidth, textHeight)

        const localX = resolveAxis<Data>(initialX, data, 0)
        const localY = resolveAxis<Data>(initialY, data, 0)

        const x = ctx.offsetX + localX
        const y = ctx.offsetY + localY

        const adjustedX = x + offset.x
        const adjustedY = y + offset.y

        context.save()
        context.translate(adjustedX, adjustedY)
        context.rotate((rotation * Math.PI) / 180)

        if (stroke) {
            context.strokeStyle = stroke.fill
            context.lineWidth = stroke.width
            context.lineJoin = "round"
            context.strokeText(content, 0, 0)
        }

        context.fillText(content, 0, 0)
        context.restore()

        const buffer = canvas.toBuffer()

        ctx.image = ctx.image.composite([
            { input: buffer, top: 0, left: 0 }
        ])
    }
}
