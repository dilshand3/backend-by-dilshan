class APIError extends Error {
    constructor(
        statucode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statucode = statucode
        this.data = null
        this.message = message
        this.succes = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {APIError}