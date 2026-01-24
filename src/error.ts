export class XpictError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "XpictError"
    }
}
