
class ApiRes {
    constructor(
       status,
       data,
       message = "Success",
    ){
       this.status= status
       this.message = message
       this.Success = status < 400
       this.data = data
    }
}

export { ApiRes }