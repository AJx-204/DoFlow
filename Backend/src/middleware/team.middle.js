import mongoose from "mongoose";
import Team from "../model/Team.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncFunc } from "../utils/asyncFunc.js";


const getTeamAndRole = asyncFunc(async(req, res, next)=>{
    const { teamId } = req.params;
    const org = req.org;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
        throw new ApiError(400, "Invalid team ID");
    };
    if(!teamId){
        throw new ApiError(
            403,
            "Team id not found"
        )
    };
    const isTeamInOrg = org.teams.some(
        (t)=> t.toString() == teamId.toString()
    );
    if(!isTeamInOrg){
        throw new ApiError(
            404,
            "Team not found in the organization"
        )
    };
    const team = await Team.findOne({
        _id: teamId,
        inOrg: org._id
    });
    if(!team){
        throw new ApiError(
            404,
            "Team not found"
        )
    };
    const teamMember = team.members.find(
        (m) => m.member.toString() == user._id.toString()
    );
    if(!teamMember){
        throw new ApiError(
            403,
            "You are not a part of this team"
        )
    };
    req.team = team;
    req.teamRole = teamMember.role;
    next();
}); 

const authorizeTeamRoles = (allowedRoles) => {
  return (req, res, next) => {
    try {
        if(!allowedRoles.includes(req.teamRole)){
          return res.status(403).json({
             success: false,
             message: "You do not have sufficient permissions to modify this Team"
          });
        };
        next();
    } catch (error) {
       next(error);
    }
  };
};


export {
    getTeamAndRole,
    authorizeTeamRoles
}

