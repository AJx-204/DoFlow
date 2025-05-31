import mongoose from "mongoose";
import Project from "../model/project/Project.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncFunc } from "../utils/asyncFunc.js";


const getProjectandRole = asyncFunc(async(req, res, next)=>{
    const { projectId } = req.params;
    const org = req.org;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid Project ID");
    };
    if(!projectId){
        throw new ApiError(
            404,
            "project id not found"
        )
    };
    const isProjectInOrg = org.projects.some(
        (p) => p.toString() == projectId.toString()
    );
    if(!isProjectInOrg){
        throw new ApiError(
            403,
            "The project is not part of this organization"
        )
    };
    const project = await Project.findOne({
        _id:projectId,
        inOrg:org._id
    });
    if(!project){
        throw new ApiError(
            404,
            "Project not found"
        )
    };
    const projectMember = project.members.find(
        (m) => m.member.toString() == user._id.toString()
    );
    if(!projectMember){
        throw new ApiError(
            403,
            "You are not part of this project"
        )
    };
    req.project = project,
    req.projectRole = projectMember.role;
    next();
});

const authorizeProjectRoles = (allowedRoles) => {
  return (req, res, next) => {
    try {
        if(!allowedRoles.includes(req.projectRole)){
          return res.status(403).json({
             success: false,
             message: "You do not have sufficient permissions to modify this Project"
          });
        };
        next();
    } catch (error) {
       next(error);
    }
  };
};


export {
    getProjectandRole,
    authorizeProjectRoles,
}