import sharp from "sharp"

import { ImageTransformFunction } from "../layers"

export function blurEffect(sigma: number | boolean | sharp.BlurOptions): ImageTransformFunction<any> {
    return ({ image }) => {
        return image.blur(sigma)
    }
}
