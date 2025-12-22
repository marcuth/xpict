import sharp from "sharp"

export async function commitFrame(image: sharp.Sharp) {
    const buffer = await image.raw().toBuffer({ resolveWithObject: false })
    const metadata = await image.metadata()

    return sharp(buffer, {
        raw: {
            width: metadata.width,
            height: metadata.height,
            channels: metadata.channels,
        }
    })
}