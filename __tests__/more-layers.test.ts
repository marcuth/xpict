import { afterEach, describe, expect, it, vi } from "vitest"
import { createCanvas, GlobalFonts } from "@napi-rs/canvas"

import path from "node:path"
import os from "node:os"
import fs from "node:fs"

import { BLANK, pixel, RED, solidPng } from "./helpers"
import { TextAlign, TextBaseline } from "../src/enums"
import xpict, { XpictError } from "../src"

type Data = { n: number }
const data: Data = { n: 1 }

const render = (layers: any[], size = 20) =>
    xpict.template<Data>({ config: { width: size, height: size }, layers }).render(data)

const tmpFile = (name: string, content: Buffer) => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "xpict-")), name)
    fs.writeFileSync(file, content)
    return file
}

const hasInk = (canvas: ReturnType<typeof createCanvas>) =>
    canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height)
        .data.some((v) => v !== 0)

describe("Template with imagePath", () => {
    it("uses the background image size and content", async () => {
        const t = xpict.template<Data>({ imagePath: tmpFile("bg.png", solidPng(8, 6)), layers: [] })
        const canvas = await t.render(data)
        expect(canvas.width).toBe(8)
        expect(canvas.height).toBe(6)
        expect(t.options.config).toEqual({ width: 8, height: 6 })
    })
})

describe("CircleLayer", () => {
    it("draws a filled circle", async () => {
        const canvas = await render([
            xpict.circle<Data>({ x: 10, y: ({ data }) => 10 * data.n, radius: 5, fill: "#ff0000" }),
        ])
        expect(pixel(canvas, 10, 10)).toEqual(RED)
        expect(pixel(canvas, 1, 1)).toEqual(BLANK)
    })
})

describe("LineLayer", () => {
    it("draws a line between two points", async () => {
        const canvas = await render([
            xpict.line<Data>({
                from: { x: 0, y: 10 },
                to: { x: ({ templateSize }) => templateSize.width, y: 10 },
                color: "#ff0000",
                width: () => 4,
            }),
        ])
        expect(pixel(canvas, 10, 10)).toEqual(RED)
        expect(pixel(canvas, 10, 2)).toEqual(BLANK)
    })
})

describe("TextLayer", () => {
    it("draws static text with stroke, rotation, alignment and weight", async () => {
        const canvas = await render(
            [
                xpict.text<Data>({
                    text: "MMMM",
                    font: { size: 16, color: "#ff0000", name: "Arial", weight: "bold" },
                    x: 20,
                    y: 20,
                    align: "center",
                    baseline: "middle",
                    rotation: 10,
                    stroke: { fill: "#ff0000", width: 2 },
                }),
            ],
            40,
        )
        expect(hasInk(canvas)).toBe(true)
    })

    it("supports function text and default font/color", async () => {
        const text = vi.fn(({ data }: { data: Data }) => `n${data.n}`)
        const canvas = await render([xpict.text<Data>({ text, font: { size: 12 }, x: 0, y: 12 })])
        expect(text).toHaveBeenCalledWith({ data, index: 0 })
        expect(hasInk(canvas)).toBe(true)
    })
})

describe("ImageLayer", () => {
    const png = solidPng(4, 2)
    const src = () => png

    it("draws at natural size from a buffer function", async () => {
        const fn = vi.fn(() => png)
        const canvas = await render([xpict.image<Data>({ src: fn, x: 2, y: 3 })])
        expect(fn).toHaveBeenCalledWith({ data, index: 0 })
        expect(pixel(canvas, 3, 4)).toEqual(RED)
        expect(pixel(canvas, 0, 0)).toEqual(BLANK)
        expect(pixel(canvas, 8, 4)).toEqual(BLANK)
    })

    it("accepts a file path", async () => {
        const canvas = await render([xpict.image<Data>({ src: tmpFile("i.png", png), x: 0, y: 0 })])
        expect(pixel(canvas, 1, 1)).toEqual(RED)
    })

    it("scales by width, height, or both", async () => {
        const byWidth = await render([xpict.image<Data>({ src, x: 0, y: 0, width: 8 })])
        expect(pixel(byWidth, 7, 3)).toEqual(RED)
        expect(pixel(byWidth, 7, 5)).toEqual(BLANK)

        const byHeight = await render([xpict.image<Data>({ src, x: 0, y: 0, height: () => 4 })])
        expect(pixel(byHeight, 7, 3)).toEqual(RED)
        expect(pixel(byHeight, 9, 3)).toEqual(BLANK)

        const both = await render([xpict.image<Data>({ src, x: 0, y: 0, width: 10, height: 10 })])
        expect(pixel(both, 9, 9)).toEqual(RED)
    })

    it("applies flip, rotate and transforms", async () => {
        const transform = vi.fn()
        const canvas = await render([
            xpict.image<Data>({
                src,
                x: 0,
                y: 0,
                width: 10,
                height: 10,
                flipX: true,
                flipY: true,
                rotate: 90,
                transform: [transform],
            }),
        ])
        expect(transform).toHaveBeenCalledOnce()
        expect(hasInk(canvas)).toBe(true)
    })

    it("applies flip only, and awaits transforms in order", async () => {
        const order: string[] = []
        await render([
            xpict.image<Data>({
                src,
                x: 0,
                y: 0,
                flipX: true,
                transform: [
                    async () => {
                        order.push("a")
                    },
                    () => {
                        order.push("b")
                    },
                ],
            }),
        ])
        expect(order).toEqual(["a", "b"])
    })

    it("works with an empty transform list", async () => {
        await expect(render([xpict.image<Data>({ src, x: 0, y: 0, transform: [] })])).resolves.toBeDefined()
    })

    it("wraps rendering failures in XpictError", async () => {
        const layer = xpict.image<Data>({
            src,
            x: 0,
            y: 0,
            transform: [
                () => {
                    throw new Error("boom")
                },
            ],
        })
        await expect(render([layer])).rejects.toThrow(XpictError)
        await expect(render([layer])).rejects.toThrow(/boom/)
    })
})

describe("effects", () => {
    const run = (effect: any) => {
        const canvas = createCanvas(6, 6)
        const ctx = canvas.getContext("2d")
        ctx.fillStyle = "#ff0000"
        ctx.fillRect(0, 0, 3, 6)
        effect({ data, index: 0, canvas, ctx })
        return canvas
    }
    const untouched = () =>
        pixel(
            run(() => {}),
            3,
            3,
        )

    it("blur softens the edge and skips radius <= 0", () => {
        expect(pixel(run(xpict.effects.blur(0)), 3, 3)).toEqual(untouched())
        expect(pixel(run(xpict.effects.blur(2)), 3, 3)).not.toEqual(untouched())
    })

    it("grayscale desaturates and skips amount <= 0", () => {
        expect(pixel(run(xpict.effects.grayscale(0)), 1, 1)).toEqual(RED)
        const [r, g, b] = pixel(run(xpict.effects.grayscale()), 1, 1)
        expect(r).toBe(g)
        expect(g).toBe(b)
    })

    it("boxBlur averages neighbours and skips radius < 1", () => {
        expect(pixel(run(xpict.effects.boxBlur(0.5)), 3, 3)).toEqual(untouched())
        const [r, , , a] = pixel(run(xpict.effects.boxBlur(1)), 3, 3)
        expect(r).toBeLessThan(255)
        expect(a).toBeGreaterThan(0)
    })
})

describe("xpict namespace", () => {
    it("exposes utils", () => {
        expect(xpict.utils.wrapText).toBeTypeOf("function")
    })
})

describe("font file registration", () => {
    afterEach(() => vi.restoreAllMocks())

    it("reads and registers the font file when filePath is given", () => {
        const read = vi.spyOn(fs, "readFileSync").mockReturnValue(Buffer.from("x"))
        const register = vi.spyOn(GlobalFonts, "register").mockReturnValue(null as any)
        const make = xpict.utils.font({ name: "Custom", filePath: "/f.ttf" })
        expect(read).toHaveBeenCalledWith("/f.ttf")
        expect(register).toHaveBeenCalledWith(Buffer.from("x"), "Custom")
        expect(make({ size: 10 })).toEqual({ name: "Custom", size: 10 })
    })
})

describe("image flips", () => {
    it("handles flipY only", async () => {
        const canvas = await render([xpict.image<Data>({ src: () => solidPng(4, 2), x: 0, y: 0, flipY: true })])
        expect(pixel(canvas, 1, 1)).toEqual(RED)
    })
})

describe("GroupLayer defaults", () => {
    it("works without x/y, dynamic offsets and skips hidden children", async () => {
        const red = xpict.rectangle<Data>({ x: 0, y: 0, width: 4, height: 4, fill: "#ff0000" })
        const hidden = xpict.rectangle<Data>({
            x: 10,
            y: 10,
            width: 4,
            height: 4,
            fill: "#ff0000",
            when: () => false,
        })
        const canvas = await render([
            xpict.group<Data>({ layers: [red, hidden] }),
            xpict.group<Data>({ x: ({ data }) => 10 * data.n, y: () => 10, layers: [red] }),
        ])
        expect(pixel(canvas, 1, 1)).toEqual(RED)
        expect(pixel(canvas, 11, 11)).toEqual(RED)
        expect(pixel(canvas, 5, 5)).toEqual(BLANK)
        expect(pixel(canvas, 15, 15)).toEqual(BLANK)
    })
})

describe("enums", () => {
    it("exposes text alignment and baseline values", () => {
        expect(TextAlign.Center).toBe("center")
        expect(TextAlign.Left).toBe("left")
        expect(TextAlign.Right).toBe("right")
        expect(Object.values(TextBaseline)).toEqual(["top", "hanging", "middle", "alphabetic", "ideographic", "bottom"])
    })
})
