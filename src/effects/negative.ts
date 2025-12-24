import { ImageTransformFunction } from "../layers"

export function negativeEffect(): ImageTransformFunction<any> {
    return ({ image }) => {
        return image.negate()
    }
}
