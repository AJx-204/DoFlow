import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { asyncFunc } from "../utils/asyncFunc.js";
import Section from "../model/project/Section.js";


const createSection = asyncFunc(async(req, res)=>{
    const { sectionName, description, status, deadline, assignedToTeam = [], assignedToMember = [] } = req.body;
    const project = req.project;
    const org = req.org;
    const user = req.user;
    if(!sectionName){
        throw new ApiError(
            400,
            "Section name is required"
        )
    };
    const teamIds = Array.isArray(assignedToTeam) ? assignedToTeam : [assignedToTeam];
    const memberIds = Array.isArray(assignedToMember) ? assignedToMember : [assignedToMember];
    if(teamIds.length > 0){
        const isTeamsInOrg  = teamIds.every(
            teamIds => org.teams.some(
                (t) => t.toString() == teamIds.toString()
            )
        );
        if(!isTeamsInOrg){
            throw new ApiError(
                404,
                "some team are not part of this Organization"
            )
        };
    }
    if(memberIds.length > 0){
        const isMembersInOrg = memberIds.every(
            memberIds => org.members.some(
                (m) => m.member.toString() == memberIds.toString()
            )
        );
        if(!isMembersInOrg){
            throw new ApiError(
                404,
                "some members are not part of this Organization"
            )
        };
    }
    const section = await Section.create({
        createdBy:user._id,
        sectionName,
        description: description || "",
        assignedToTeam: teamIds.map(id => new mongoose.Types.ObjectId(id)),
        assignedToMember: memberIds.map(id => new mongoose.Types.ObjectId(id)),
        inProject:project._id,
        status:status || "New Added",
        deadline: deadline ? new Date(deadline) : null
    });
    const popoulatedSection = await section.populate([
        {
            path:'createdBy',
            select:'userName email profilePhoto'
        },{
            path:'assignedToTeam',
            select:'teamName'
        },{
            path:'assignedToMember',
            select:'userName email profilePhoto'
        }
    ])
    project.projectSections.push(section);
    await project.save();
    return res.status(200)
    .json(
        new ApiRes(
            200,
            popoulatedSection,
            "Project's section created successfully"
        )
    );
});

const updateSection = asyncFunc(async (req, res) => {
    const { sectionId } = req.params;
    const {
        sectionName,
        description,
        status,
        deadline,
        assignedToTeam = [],
        assignedToMember = []
    } = req.body;
    const org = req.org;
    const project = req.project;
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
         throw new ApiError(400, "Invalid section ID");
    }
    const isSectionInProject = project.projectSections.some(
        (s) => s.toString() == sectionId.toString()
    );
    if(!isSectionInProject){
        throw new ApiError(
            404,
            "The Section is not part or this project"
        )
    };
    const section = await Section.findById(sectionId);
    if (!section) {
        throw new ApiError(404, "Section not found");
    };
    const teamIds = Array.isArray(assignedToTeam) ? assignedToTeam : [assignedToTeam];
    if (teamIds.length > 0) {
        const isTeamsInOrg = teamIds.every(teamId =>
            org.teams.some(t => t.toString() === teamId.toString())
        );
        if (!isTeamsInOrg) {
            throw new ApiError(404, "Some teams are not part of this Organization");
        }
    };
    const memberIds = Array.isArray(assignedToMember) ? assignedToMember : [assignedToMember];
    if (memberIds.length > 0) {
        const isMembersInOrg = memberIds.every(memberId =>
            org.members.some(m => m.member.toString() === memberId.toString())
        );
        if (!isMembersInOrg) {
            throw new ApiError(404, "Some members are not part of this Organization");
        }
    };
    if (sectionName) section.sectionName = sectionName;
    if (description !== undefined) section.description = description;
    if (status) section.status = status;
    section.deadline = deadline ? new Date(deadline) : null;
    section.assignedToTeam = teamIds.map(id => new mongoose.Types.ObjectId(id));
    section.assignedToMember = memberIds.map(id => new mongoose.Types.ObjectId(id));
    await section.save();
    const populatedSection = await section.populate([
        {
            path: 'createdBy',
            select: 'userName email profilePhoto'
        },
        {
            path: 'assignedToTeam',
            select: 'teamName'
        },
        {
            path: 'assignedToMember',
            select: 'userName email profilePhoto'
        }
    ]);
    return res.status(200).json(
        new ApiRes(
            200,
            populatedSection,
            "Section updated successfully"
        )
    );
});

const deleteSection = asyncFunc(async(req, res)=>{
    const { sectionId } = req.params;
    const project = req.project;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        throw new ApiError(400, "Invalid section ID");
    };
    const isSectionInProject = project.projectSections.some(
        (s) => s.toString() == sectionId.toString()
    );
    if(!isSectionInProject){
        throw new ApiError(
            404,
            "The Section is not part or this project"
        )
    };
    const member = project.members.find(
        (m) => m.member.toString() === user._id.toString()
    );
    if(!member){
        throw new ApiError(
            404,
            "you are not part of this project"
        )
    };
    const role = member?.role || "member";
    const isAdminOrModerator = role === "admin" || role === "moderator";
    const section = await Section.findById(sectionId);
    if (!section) {
        throw new ApiError(404, "Section not found");
    };
    const isCreator = section.createdBy.toString() == user._id.toString();
    if(isCreator || isAdminOrModerator){
        await Section.findByIdAndDelete(sectionId);
        project.projectSections.pull(sectionId);
        await project.save();
        return res.status(200)
        .json(
            new ApiRes(
                200,
                null,
                "Project's section deleted successfully"
            )
        );
    }else{
        throw new ApiError(
            403,
            "Only section creator can delete the section"
        )
    };
    
});

const transferOwnerShipOfSection = asyncFunc(async(req, res)=>{
    const { memberId } = req.params;    
    const project = req.project;
    const user = req.user;
    const { sectionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new ApiError(400, "Invalid member ID");
    };
     if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        throw new ApiError(400, "Invalid section ID");
    };
    const isSectionInProject = project.projectSections.some(
        (s) => s.toString() == sectionId.toString()
    );
    if(!isSectionInProject){
        throw new ApiError(
            4040,
            "Section not found in this project"
        )
    };
    const member = project.members.find(
        (m) => m.member.toString() === user._id.toString()
    );
    if(!member){
        throw new ApiError(
            404,
            "you are not part of this project"
        )
    };
    const role = member?.role || "member";
    const isAdminOrModerator = role === "admin" || role === "moderator";
    const section = await Section.findOne({
        _id:sectionId, inProject:project._id
    });
    if(!section){
        throw new ApiError(
            404,
            "Section not found"
        )
    };
    const isOwner = section.createdBy.toString() == user._id.toString()
    if(isOwner || isAdminOrModerator){
          section.createdBy = memberId;
          section.save();
          const popoulatedSection = await section.populate([
             {
                path:'createdBy',
                select:"userName email profilePhoto"
             },{
                path:'assignedToTeam',
                select:"teamName"
             },{
                path:'assignedToMember',
                select:"userName email profilePhoto"
             }
          ]);
          return res.status(200)
          .json(
              new ApiRes(
                  200,
                  popoulatedSection,
                  "ownership transfer successfully"
              )
          );
    }else{
        throw new ApiError(
            403,
            "You can't delete this section"
        )
    };
   
});


export {
    createSection,
    updateSection,
    deleteSection,
    transferOwnerShipOfSection
}