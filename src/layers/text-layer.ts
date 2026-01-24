import { Layer, RenderOptions, WhenFunction } from "./layer"
import { Axis, resolveAxis } from "../utils/resolve-axis"
import { ValueOfEnum } from "../utils/value-of-enum"
import { TextBaseline, TextAlign } from "../enums"
import { Font } from "../utils/font"

export type Stroke = {
    fill: string
    width: number
}

export type TextFunctionOptions<Data> = {
    data: Data
    index: number
}

export type StringFunction<Data> = (options: TextFunctionOptions<Data>) => string

export type TextLayerOptions<Data> = {
    text: StringFunction<Data> | string
    font: Font
    x: Axis<Data>
    y: Axis<Data>
    align?: ValueOfEnum<TextAlign>
    baseline?: ValueOfEnum<TextBaseline>
    stroke?: Stroke
    rotation?: number
    when?: WhenFunction<Data>
}

export class TextLayer<Data> extends Layer<Data> {
    constructor(private readonly options: TextLayerOptions<Data>) {
        super(options.when)
    }

    async render({ context: renderContext, data, index = 0, templateConfig }: RenderOptions<Data>): Promise<void> {
        const { text, font, x: initialX, y: initialY, stroke, rotation = 0, align, baseline } = this.options

        const context = renderContext.ctx

        if (align) {
            context.textAlign = align
        }

        if (baseline) {
            context.textBaseline = baseline
        }

        context.font = `${font.size}px ${font.name ?? "Arial"}`
        context.fillStyle = font.color ?? "#000"

        const content = typeof text === "string" ? text : text({ data: data, index: index })

        const localX = resolveAxis<Data>({
            axis: initialX,
            data: data,
            index: index,
            templateConfig: templateConfig,
        })

        const localY = resolveAxis<Data>({
            axis: initialY,
            data: data,
            index: index,
            templateConfig: templateConfig,
        })

        const x = renderContext.offsetX + localX
        const y = renderContext.offsetY + localY

        context.save()
        context.translate(x, y)
        context.rotate((rotation * Math.PI) / 180)

        if (stroke) {
            context.strokeStyle = stroke.fill
            context.lineWidth = stroke.width
            context.lineJoin = "round"
            context.strokeText(content, 0, 0)
        }

        context.fillText(content, 0, 0)
        context.restore()
    }
}
