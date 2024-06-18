class APIERROR extends Error {
    constructor(
        statucode,
        message = "Something went wrong",
        errors = [],
        statck = ""
    ){
        super(message)
        this.statucode = statucode
        this.data = null
        this.message = message
        this.succes = false
        this.errors = errors

        if (statck) {
            this.stack = statck
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {APIERROR}