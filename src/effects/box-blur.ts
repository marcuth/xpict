import { TransformOptions } from "../layers/image-layer"

export function boxBlur<Data>(radius: number) {
    return ({ canvas, ctx }: TransformOptions<Data>) => {
        const r = Math.floor(radius)
        if (r <= 0) return

        const width = canvas.width
        const height = canvas.height

        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data
        const sourceData = new Uint8ClampedArray(data)

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let red = 0,
                    green = 0,
                    blue = 0,
                    alpha = 0
                let count = 0

                for (let i = -r; i <= r; i++) {
                    const nx = x + i

                    if (nx >= 0 && nx < width) {
                        const sourceIndex = (y * width + nx) * 4
                        red += sourceData[sourceIndex]
                        green += sourceData[sourceIndex + 1]
                        blue += sourceData[sourceIndex + 2]
                        alpha += sourceData[sourceIndex + 3]
                        count++
                    }
                }

                const targetIndex = (y * width + x) * 4
                data[targetIndex] = red / count
                data[targetIndex + 1] = green / count
                data[targetIndex + 2] = blue / count
                data[targetIndex + 3] = alpha / count
            }
        }

        sourceData.set(data)

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let red = 0,
                    green = 0,
                    blue = 0,
                    alpha = 0
                let count = 0

                for (let i = -r; i <= r; i++) {
                    const ny = y + i
                    if (ny >= 0 && ny < height) {
                        const sourceIndex = (ny * width + x) * 4
                        red += sourceData[sourceIndex]
                        green += sourceData[sourceIndex + 1]
                        blue += sourceData[sourceIndex + 2]
                        alpha += sourceData[sourceIndex + 3]
                        count++
                    }
                }

                const targetIndex = (y * width + x) * 4
                data[targetIndex] = red / count
                data[targetIndex + 1] = green / count
                data[targetIndex + 2] = blue / count
                data[targetIndex + 3] = alpha / count
            }
        }

        ctx.putImageData(imageData, 0, 0)
    }
}
