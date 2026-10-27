import { describe, expect, it } from "vitest"

import { resolveDimension } from "../src/utils/resolve-dimension"
import { resolveAxis } from "../src/utils/resolve-axis"
import { wrapText, font } from "../src/utils"

const templateSize = { width: 100, height: 50 }

describe("resolveAxis", () => {
    it("returns numbers as-is", () => {
        expect(resolveAxis({ axis: 10, data: {}, index: 0, templateSize })).toBe(10)
    })

    it("calls functions with data, index and templateSize", () => {
        const axis = ({ data, index, templateSize }: any) => data.x + index + templateSize.width
        expect(resolveAxis({ axis, data: { x: 1 }, index: 2, templateSize })).toBe(103)
    })
})

describe("resolveDimension", () => {
    it("returns numbers as-is", () => {
        expect(resolveDimension({ dimension: 20, data: {}, index: 0, templateSize })).toBe(20)
    })

    it("calls functions with context", () => {
        const dimension = ({ templateSize }: any) => templateSize.height / 2
        expect(resolveDimension({ dimension, data: {}, index: 0, templateSize })).toBe(25)
    })
})

describe("wrapText", () => {
    it("keeps short text on one line", () => {
        expect(wrapText("hello world", 100)).toEqual(["hello world "])
    })

    it("wraps when exceeding max width", () => {
        const lines = wrapText("aaa bbb ccc", 8)
        expect(lines.length).toBeGreaterThan(1)
        expect(lines.join("").replace(/\s+/g, " ").trim()).toBe("aaa bbb ccc")
    })
})

describe("font", () => {
    it("merges config with partial options", () => {
        const f = font({ name: "Arial", color: "red" })
        expect(f({ size: 12 })).toEqual({ name: "Arial", color: "red", size: 12 })
    })

    it("lets partial options override config and omits filePath", () => {
        const f = font({ name: "Arial", color: "red", weight: "bold" })
        const result = f({ size: 10, color: "blue" })
        expect(result.color).toBe("blue")
        expect(result.weight).toBe("bold")
        expect(result).not.toHaveProperty("filePath")
    })
})
