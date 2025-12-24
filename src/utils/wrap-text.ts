export function wrapText(text: string, maxWidth: number) {
    const words = text.split(" ")

    let line = ""

    const lines = []

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " "

        if (testLine.length > maxWidth && n > 0) {
            lines.push(line)
            line = words[n] + " "
        } else {
            line = testLine
        }
    }

    lines.push(line)

    return lines.join("\n")
}
