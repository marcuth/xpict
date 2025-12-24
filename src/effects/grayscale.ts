import { ImageTransformFunction } from "../layers"

export function grayscaleEffect(): ImageTransformFunction<any> {
    return ({ image }) => {
        return image.grayscale()
    }
}
