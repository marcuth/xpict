import { describe, expect, it, vi } from "vitest"

import xpict, { Layer, XpictError } from "../src"
import { BLANK, pixel, RED } from "./helpers"

type Data = { show: boolean }

describe("Template", () => {
    it("renders a canvas with the configured size and fill", async () => {
        const t = xpict.template<Data>({ config: { width: 20, height: 10, fill: "#ff0000" }, layers: [] })
        const canvas = await t.render({ show: true })
        expect(canvas.width).toBe(20)
        expect(canvas.height).toBe(10)
        expect(pixel(canvas, 5, 5)).toEqual(RED)
    })

    it("throws XpictError without config or imagePath", async () => {
        const t = xpict.template<Data>({ layers: [] } as any)
        await expect(t.render({ show: true })).rejects.toBeInstanceOf(XpictError)
    })
})

describe("RectangleLayer", () => {
    it("draws a rectangle at x/y", async () => {
        const t = xpict.template<Data>({
            config: { width: 20, height: 20 },
            layers: [xpict.rectangle<Data>({ x: 5, y: 5, width: 10, height: 10, fill: "#ff0000" })],
        })
        const canvas = await t.render({ show: true })
        expect(pixel(canvas, 10, 10)).toEqual(RED)
        expect(pixel(canvas, 2, 2)).toEqual(BLANK)
    })

    it("supports dynamic dimensions and border radius", async () => {
        const t = xpict.template<Data>({
            config: { width: 20, height: 20 },
            layers: [
                xpict.rectangle<Data>({
                    x: 0,
                    y: 0,
                    width: ({ templateSize }) => templateSize.width,
                    height: 20,
                    fill: "#ff0000",
                    borderRadius: 8,
                }),
            ],
        })
        const canvas = await t.render({ show: true })
        expect(pixel(canvas, 10, 10)).toEqual(RED)
        expect(pixel(canvas, 0, 0)).toEqual(BLANK)
    })

    it("skips rendering when `when` returns false", async () => {
        const t = xpict.template<Data>({
            config: { width: 10, height: 10 },
            layers: [
                xpict.rectangle<Data>({
                    x: 0,
                    y: 0,
                    width: 10,
                    height: 10,
                    fill: "#ff0000",
                    when: ({ data }) => data.show,
                }),
            ],
        })
        expect(pixel(await t.render({ show: false }), 5, 5)).toEqual(BLANK)
        expect(pixel(await t.render({ show: true }), 5, 5)).toEqual(RED)
    })
})

describe("GroupLayer", () => {
    it("offsets children and restores the offset afterwards", async () => {
        const t = xpict.template<Data>({
            config: { width: 30, height: 30 },
            layers: [
                xpict.group<Data>({
                    x: 10,
                    y: 10,
                    layers: [xpict.rectangle<Data>({ x: 0, y: 0, width: 5, height: 5, fill: "#ff0000" })],
                }),
                xpict.rectangle<Data>({ x: 0, y: 0, width: 5, height: 5, fill: "#ff0000" }),
            ],
        })
        const canvas = await t.render({ show: true })
        expect(pixel(canvas, 12, 12)).toEqual(RED)
        expect(pixel(canvas, 2, 2)).toEqual(RED)
        expect(pixel(canvas, 20, 20)).toEqual(BLANK)
    })
})

describe("RepeatLayer", () => {
    type Items = { items: number[] }

    it("renders one layer per item with spacing", async () => {
        const t = xpict.template<Items>({
            config: { width: 30, height: 10 },
            layers: [
                xpict.repeat<Items, number>({
                    each: ({ data }) => data.items,
                    x: ({ index }) => index * 10,
                    y: 0,
                    layer: () => xpict.rectangle<Items>({ x: 0, y: 0, width: 5, height: 5, fill: "#ff0000" }),
                }),
            ],
        })
        const canvas = await t.render({ items: [1, 2, 3] })
        expect(pixel(canvas, 2, 2)).toEqual(RED)
        expect(pixel(canvas, 12, 2)).toEqual(RED)
        expect(pixel(canvas, 22, 2)).toEqual(RED)
        expect(pixel(canvas, 7, 2)).toEqual(BLANK)
    })

    it("does nothing with an empty list", async () => {
        const layer = vi.fn()
        const t = xpict.template<Items>({
            config: { width: 10, height: 10 },
            layers: [xpict.repeat<Items, number>({ each: () => [], x: 0, y: 0, layer })],
        })
        await t.render({ items: [] })
        expect(layer).not.toHaveBeenCalled()
    })
})

describe("Layer", () => {
    it("shouldRender defaults to true", () => {
        class L extends Layer {
            async render() {}
        }
        expect(new L().shouldRender({})).toBe(true)
    })
})

describe("XpictError", () => {
    it("has the right name", () => {
        expect(new XpictError("x").name).toBe("XpictError")
    })
})
