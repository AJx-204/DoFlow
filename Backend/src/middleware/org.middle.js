import mongoose from "mongoose";
import Organization from "../model/org.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncFunc } from "../utils/asyncFunc.js";


const getOrgAndRole = asyncFunc(async(req, res, next)=>{
    const { orgId } = req.params;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Invalid organization ID");
    };
    if(!orgId || !user){
        throw new ApiError(
            400,
            'Missing Organization information or user not authenticated.'
        )
    };
    const org = await Organization.findById(orgId);
    if(!org){
        throw new ApiError(
            404,
            "Organization not found"
        )
    };
    const userInOrg = user.inOrg.find(o => o.org.toString() === orgId.toString());
    if(!userInOrg){
        throw new ApiError(
            403,
            "you are not a part of this Organization"
        )
    };
    req.org = org,
    req.orgRole = userInOrg.role;
    next();
});

const authorizeOrgRoles = (allowedRoles) => {
  return (req, res, next) => {
    try {
        if(!allowedRoles.includes(req.orgRole)){
          return res.status(403).json({
             success: false,
             message: "You do not have sufficient permissions to modify this Organization"
          });
        };
        next();
    } catch (error) {
       next(error);
    }
  };
};

export {
    getOrgAndRole,
    authorizeOrgRoles,
}