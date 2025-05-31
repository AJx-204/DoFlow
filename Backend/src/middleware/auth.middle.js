import jwt from "jsonwebtoken";
import User from "../model/User.js";
import { asyncFunc } from "../utils/asyncFunc.js";
import { ApiError } from "../utils/ApiError.js";


export const verifyJwt = asyncFunc( async ( req, _, next) => {
    const token = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
    if(!token){
      throw new ApiError(
          401,
          "Unauthorized request"
      )
    };
    try {
      const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      const user = await User.findById(decodedToken?._id).select(
          "-password -refreshToken"
      );
      if(!user){
        throw new ApiError(
            401,
            "User not found"
        )
      };
      req.user = user;
      next()
    } catch (error) {
      throw new ApiError(
         401,
         "Invalid or expired token"
      )
    };
});