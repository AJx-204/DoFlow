
const asyncFunc = (func) => async (req, res, next) => {
   try {
      await func(req, res, next)
   } catch (error) {
     const statusCode = error.code === 11000 ? 409 : 500; 
      res.status(statusCode || 500).json({
        success : false,
        message : error.message
      })
   }
}

export { asyncFunc };