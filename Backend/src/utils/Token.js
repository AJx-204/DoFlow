import User from "../model/User.js";
import { ApiError } from "./ApiError.js";


const generateTokens = async (userId) => {
      try {
         const user = await User.findById(userId)
         const accessToken = user.generateAccessToken()
         const refreshToken = user.generateRefreshToken()
         user.refreshToken = refreshToken
         await user.save({
            validateBeforeSave:false
         });
         return {accessToken, refreshToken}
      } catch (error) {
         throw new ApiError(500, 'Something went wrong while generating refresh and access tokens')
      };
};


export { generateTokens }