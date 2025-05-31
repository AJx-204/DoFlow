
class ApiError extends Error {
    constructor(
       status,
       message = "Something went wrong" ,
       errors = [],
       stack = "",
    ){
        super(message)
        this.status = status
        this.message = message
        this.errors = errors
        stack ? this.stack = stack : Error.captureStackTrace(this, this.stack)
    }
}

export  { ApiError };