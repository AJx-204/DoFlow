import mongoose from "mongoose";
import Project from "../model/project/Project.js";
import Team from "../model/Team.js";
import User from "../model/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { asyncFunc } from "../utils/asyncFunc.js";
import { sendEmail } from '../service/SendEmail.js';


const createProject = asyncFunc(async(req, res)=>{
    const { projectName, description } = req.body;
    const org = req.org;
    const user = req.user;
    if(!projectName){
        throw new ApiError(
            400,
            "project Name is required"
        )
    };
    const project = await Project.create({
        createdBy:user._id,
        inOrg:org._id,
        projectName,
        description:description || "",
        members:[{
            member:user._id,
            role:'admin'
        }],
    });
    if(!project){
        throw new ApiError(
            500,
            "Failed to create project due to server error, please try again later"
        )
    };
    user.inProject.push({
        project:project._id,
        role:'admin'
    });
    await user.save();
    org.timeline.push({
        text:`<b>${user.userName}</b> created a project - <i>${projectName}</i>.`
    })
    org.projects.push(project._id);
    await org.save();
    const populatedProject = await Project.findById(project._id).populate([
        {
            path:"createdBy",
            select:"userName email profilePhoto"
        },{
            path:"members.member",
            select:"userName email profilePhoto"
        }
    ])
    return res.status(200)
    .json(
        new ApiRes(
            200,
            populatedProject,
            "project created successfully"
        )
    )
});

const updateProject = asyncFunc(async(req, res)=>{
    const { projectName, description } = req.body;
    const project = req.project;
    const user = req.user;
    if(projectName) project.projectName = projectName;
    if(description) project.description = description || "";
    await project.save();
    return res.status(200)
    .json(
        new ApiRes(
            200,
            project,
            "project details updated successfully"
        )
    );
});

const deleteProject = asyncFunc(async(req, res)=>{
    const project = req.project;
    const org = req.org;
    const user = req.user;
    if(user._id.toString() !== project.createdBy.toString()){
        throw new ApiError(
            403,
            "Only project owner can delete the project."
        )
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      
        org.projects = org.projects.filter(
            (p) => p.toString() !== project._id.toString()
        );
        org.timeline.push({
            text:`<b>${user.userName}</b> delete the project - <i>${project.projectName}</i>`
        });
        await org.save({ session });
        const memberIds = project.members.map((m) => m.member);
        await User.updateMany(
            { _id:{
                $in:memberIds
              }
            },{
                $pull:{
                    inProject:{
                        project:project._id
                    }
                }
            },{ session }
        );  
        await Team.updateMany(
            { inOrg:org._id},{
                $pull:{
                    projects:project._id
                }
            },{ session }
        );
        await Project.deleteOne({
            _id:project._id
        },{ session });
        await session.commitTransaction();
        session.endSession();
        return res.status(200)
        .json(
            new ApiRes(
                200,
                null,
                "Project deleted successfully"
            )
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(
            500,
            "Failed to delete Project due to server error, please try again later"
        )
    };
});

const addMemberInProject = asyncFunc(async(req, res)=>{
    const { memberId } = req.params;
    const { asRoleOf } = req.body;
    const project = req.project;
    const user = req.user;
    const org = req.org;
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new ApiError(400, "Invalid member ID");
    };
    const isMemberInOrg  = org.members.some(
        (m) => m.member.toString() == memberId.toString()
    );
    if(!isMemberInOrg){
        throw new ApiError(
            404,
            "The Member is not part of this organization"
        )
    };
    const isMemberInProject = project.members.some(
        (m) => m.member.toString() == memberId.toString()
    );
    if(isMemberInProject){
        throw new ApiError(
            403,
            "Member is already part of this project"
        )
    };
    const member = await User.findByIdAndUpdate(memberId, {
        $push:{
            inProject:{
                project:project._id,
                role:asRoleOf || "member"
            }
        }
    });
    project.members.push({
        member:memberId,
        role:asRoleOf || "member"
    });
    await project.save();
    const populatedProject = await project.populate([
        {
            path: "createdBy",
            select: "userName email profilePhoto"
        },
        {
            path: "members.member",
            select: "userName email profilePhoto"
        }
    ]);
    sendEmail({
        to:member.email,
        subject:`You've been added to project: ${project.projectName}`,
        html : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fdfdfd;">
            <h2 style="color: #333;">👋 Hello ${member.userName},</h2>
            <p style="font-size: 16px; color: #444;">
              You have been successfully added to the project - <strong>${project.projectName}</strong> in the organization - <span style="color:green">${org.orgName}</span>
            </p>
            <p style="font-size: 15px; color: #555;">
              <strong>Added by:</strong> ${user.userName}
            </p>
            <p style="font-size: 15px; color: #555;">
              You can now collaborate with the team on this project.
            </p>
          </div>
          `
    })
    return res.status(200)
    .json(
        new ApiRes(
            200,
            populatedProject,
            "Member successfully added in to project"
        )
    );
});

const addTeamInProject = asyncFunc(async(req, res)=>{
    const { teamId } = req.params;
    const { asRoleOf } = req.body;
    const project = req.project;
    const org = req.org;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
        throw new ApiError(400, "Invalid team ID");
    };
    const team = await Team.findOne(
        { _id: teamId, inOrg:org._id}
    ).populate({
        path:'members.member',
        select:"userName email"
    });
    if(!team){
        throw new ApiError(
            404,
            "Team not found in this organization"
        )
    };
    const isTeamInProject = project.teams.some(t => t.toString() === teamId.toString());
    if (isTeamInProject) {
        throw new ApiError(
            403,
            "Team is already in this project"
        )
    };
    project.teams.push(team._id);
    const addedMemberIds = new Set(project.members.map(m => m.member.toString()));
    const newlyAddedUsers = [];
    for (const tm of team.members) {
        const memberId = tm.member._id.toString();
        const role = asRoleOf || "member";
        if (!addedMemberIds.has(memberId)) {
            project.members.push({ member: tm.member._id, role });
            await User.updateOne(
                { _id: tm.member._id },
                {
                    $addToSet: {
                        inProject: {
                            project: project._id,
                            role
                        }
                    }
                }
            );
            newlyAddedUsers.push(tm.member);
            addedMemberIds.add(memberId); 
        }
    };
    await project.save();
    const populatedProject = await project.populate([
        { path: "createdBy", select: "userName email" },
        { path: "members.member", select: "userName email profilePhoto" },
        { path: "teams", select: "teamName" }
    ]);
    for (const member of newlyAddedUsers) {
        sendEmail({
            to: member.email,
            subject: `You've been added to project: ${project.projectName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fdfdfd;">
                    <h2 style="color: #333;">👋 Hello ${member.userName},</h2>
                    <p style="font-size: 16px; color: #444;">
                        You have been successfully added to the project - <strong>${project.projectName}</strong> in the organization - <span style="color:green">${org.orgName}</span>
                    </p>
                    <p style="font-size: 15px; color: #555;">
                        <strong>Added by:</strong> ${user.userName}
                    </p>
                    <p style="font-size: 15px; color: #555;">
                        You can now collaborate with the team on this project.
                    </p>
                </div>
            `
        });
    };
    return res.status(200)
    .json(
        new ApiRes(
            200,
            populatedProject,
            `Team '${team.teamName}' and its members added to the project`
        )
    );
});

const removeMemberFromProject = asyncFunc(async(req, res)=>{
    const { memberId } = req.params;
    const project = req.project;
    const user = req.user;
    const org = req.org;
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
         throw new ApiError(400, "Invalid member ID");
    };
    const isMemberInProject = project.members.some(
        (m) => m.member.toString() == memberId.toString()
    );
    if(!isMemberInProject){
        throw new ApiError(
            404,
            "Member not found in project"
        )
    };
    const isOwnerOfProject = project.createdBy.toString() == memberId.toString();
    if(isOwnerOfProject){
        throw new ApiError(
            403,
            "You can't Remove the owner of project from the project"
        )
    };
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const removedMember = await User.findByIdAndUpdate(memberId,
            {
                $pull:{
                    inProject:{
                        project:project._id
                    }
                }
            },{ session }
        );
        project.members.pull({
            member:memberId
        });
        await project.save({ session });
        sendEmail({
            to:removedMember.email,
            subject:`Notice: you have been removed from the project ${project.projectName}`,
            html: `
                <div style="max-width: 600px; margin: auto; padding: 24px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #d32f2f; font-size: 22px; margin-bottom: 10px;">🚫 Removed from Project</h2>
                    <p style="font-size: 16px; color: #333;">Hi <strong>${removedMember.userName}</strong>,</p>
                    <p style="font-size: 15px; color: #444; line-height: 1.6;">
                        We wanted to let you know that you have been removed from the project 
                        <strong>"${project.projectName}"</strong> in the organization 
                        <strong style="color: green;">${org.orgName}</strong>.
                    </p>
                    <p style="font-size: 15px; color: #444;">
                        If you believe this was a mistake, please get in touch with your organization administrator or the project owner.
                    </p>
                    <div style="margin: 24px 0; border-left: 4px solid #f44336; padding-left: 16px; background-color: #fdf0f0; border-radius: 4px;">
                        <p style="margin: 0; font-size: 14px; color: #555;"><strong>Removed by:</strong> ${user.userName}</p>
                        <p style="margin: 0; font-size: 14px; color: #555;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    <p style="font-size: 14px; color: #777; margin-top: 20px;">— The DoFlow Team</p>
                    <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 30px;">
                        This is an automated message. Please do not reply.
                    </p>
                </div>
            `
        });
        await session.commitTransaction();
        session.endSession();
        const populatedProject = await project.populate([
            {
                path:'createdBy',
                select:"userName email profilePhoto"
            },
            {
                path:'members.member',
                select:'userName email profilePhoto'
            }
        ]);
        return res.status(200)
        .json(
            new ApiRes(
                200,
                populatedProject,
                "member successfully removed from the project"
            )
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(
            500,
            "Failed to remove Member from the project due to server, please try again later"
        )
    };
});

const removeTeamFromProject = asyncFunc(async(req, res)=>{
    const { teamId } = req.params;
    const project = req.project;
    const org = req.org;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
        throw new ApiError(400, "Invalid team ID");
    };
    const isTeamInProject = project.teams.some(t => t.toString() === teamId.toString());
    if (!isTeamInProject) {
        throw new ApiError(
            404, 
            "Team is not part of this project"
        );
    };
    const team = await Team.findOne({ _id: teamId, inOrg: org._id }).populate({
        path: 'members.member',
        select: 'userName email inProject'
    });
    if (!team) {
        throw new ApiError(
            404, "Team not found in this organization"
        );
    }
    const session = await mongoose.startSession();
    session.startTransaction();
     try {
        project.teams.pull(teamId);
        const removedMembers = [];
        for (const tm of team.members) {
            const memberId = tm.member._id.toString();
            const isInProject = project.members.some(m => m.member.toString() === memberId);
            if (!isInProject) continue;
            const isInOtherTeam = await Team.exists({
                _id: { $ne: teamId },
                _id: { $in: project.teams },
                'members.member': memberId
            });
            const isOwner = memberId === project.createdBy.toString();
            if (!isInOtherTeam && !isOwner) {
                project.members = project.members.filter(m => m.member.toString() !== memberId);
                await User.updateOne(
                    { _id: memberId },
                    { $pull: { inProject: { project: project._id } } },
                    { session }
                );
                removedMembers.push(tm.member); 
            }
        }
        await project.save({ session });
        for (const removedMember of removedMembers) {
            sendEmail({
                to: removedMember.email,
                subject: `Notice: You have been removed from the project ${project.projectName}`,
                html: `
                <div style="max-width: 600px; margin: auto; padding: 24px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #d32f2f; font-size: 22px; margin-bottom: 10px;">🚫 Removed from Project</h2>
                    <p style="font-size: 16px; color: #333;">Hi <strong>${removedMember.userName}</strong>,</p>
                    <p style="font-size: 15px; color: #444; line-height: 1.6;">
                        You have been removed from the project 
                        <strong>"${project.projectName}"</strong> in the organization 
                        <strong style="color: green;">${org.orgName}</strong>.
                    </p>
                    <p style="font-size: 15px; color: #444;">
                        If you believe this was a mistake, please contact your organization administrator or the project owner.
                    </p>
                    <div style="margin: 24px 0; border-left: 4px solid #f44336; padding-left: 16px; background-color: #fdf0f0; border-radius: 4px;">
                        <p style="margin: 0; font-size: 14px; color: #555;"><strong>Removed by:</strong> ${user.userName}</p>
                        <p style="margin: 0; font-size: 14px; color: #555;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    <p style="font-size: 14px; color: #777; margin-top: 20px;">— The DoFlow Team</p>
                    <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 30px;">
                        This is an automated message. Please do not reply.
                    </p>
                </div>
                `
            });
        }
        await session.commitTransaction();
        session.endSession();
        const populatedProject = await project.populate([
            { path: "createdBy", select: "userName email profilePhoto" },
            { path: "members.member", select: "userName email profilePhoto" },
            { path: "teams", select: "teamName" }
        ]);
        return res.status(200).json(
            new ApiRes(
                200,
                populatedProject,
                `Team '${team.teamName}' and its members removed from the project`
            )
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(
            500, 
            "Failed to remove team from the project. Please try again later."
        );
    };
});

const changeProjectMemberRole = asyncFunc(async(req, res)=>{
    const { asRoleOf } = req.body;
    const { memberId } = req.params;
    const user = req.user;
    const project = req.project;
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new ApiError(400, "Invalid member ID");
    };
    const isMemberInProject = project.members.some(
        (m) => m.member.toString() == memberId.toString()
    );
    if(!isMemberInProject){
        throw new ApiError(
            404,
            "The member is not part of this project"
        )
    };
    const isOwner = memberId.toString() == project.createdBy.toString();
    if(isOwner){
        throw new ApiError(
            403,
            "You can't change role of a project owner"
        )
    };
    const validRoles = ['admin', 'moderator', 'leader', 'member', 'viewer'];
    if(!validRoles.includes(asRoleOf)){
        throw new ApiError(
            400,
            "Invalid role"
        )
    };
    const member = project.members.find(
        (m) => m.member.toString() === memberId.toString()
    );
    if (member) {
        member.role = asRoleOf;
    }
    await project.save();
    await User.updateOne(
        { _id: memberId, "inProject.project": project._id },
        { $set: { "inProject.$.role": asRoleOf } }
    );
    const populatedProject = await project.populate([
         {
            path:"createdBy",
            select:"userName email profilePhoto"
        },{
            path:"members.member",
            select:"userName email profilePhoto"
        }
    ]);
    return res.status(200)
    .json(
        new ApiRes(
            200,
            populatedProject,
            "member role updated successfully"
        )
    );
});

const leaveProject = asyncFunc(async(req, res)=>{
    const project = req.project;
    const user = req.user;
    const userId = user._id.toString();
    const projectId = project._id;
    if (userId === project.createdBy.toString()) {
        throw new ApiError(
            403, 
            "Project owner can't leave the project."
        );
    };
    const isInProject = project.members.some(
        m => m.member.toString() === userId
    );
    if (!isInProject) {
        throw new ApiError(
            400, 
            "You are not a member of this project."
        );
    };
    const session = await mongoose.startSession();
    session.startTransaction();
      try {
        project.members = project.members.filter(
            m => m.member.toString() !== userId
        );
        await User.updateOne(
            { _id: userId },
            { $pull: { 
                inProject: 
                { project: projectId } 
              } 
            },
            { session }
        );
        await project.save({ session });
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json(
            new ApiRes(
                200,
                null,
                `You have successfully left the project '${project.projectName}'.`
            )
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(
            500,
            "Failed to leave the project. Please try again later."
        );
    }
});

const transferOwnershipOfProject = asyncFunc(async(req, res)=>{
    const { memberId } = req.params;
    const user = req.user;
    const project = req.project;
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new ApiError(400, "Invalid member ID");
    };
    const isMemberInProject = project.members.some(
        (m) => m.member.toString() == memberId.toString()
    );
    if(!isMemberInProject){
        throw new ApiError(
            404,
            "The member is not part of this project"
        )
    };
    const isOwner = user._id.toString() == project.createdBy.toString();
    if(!isOwner){
        throw new ApiError(
            403,
            "only project owner can transfer ownership or the project"
        )
    };
    project.createdBy = memberId;
    const member = project.members.find(
        (m) => m.member.toString() === memberId.toString()
    );
    if (member) {
        member.role = "admin";
    }
    await project.save();
    await User.updateOne(
        {_id:memberId, "inProject.project":project._id},
        {
            $set:{
                "inProject.$.role":"admin"
            }
        }
    );
    const populatedProject = await project.populate([
        {
            path:"createdBy",
            select:"userName email profilePhoto"
        },{
            path:"members.member",
            select:"userName email profilePhoto"
        }
    ]);
    return res.status(200)
    .json(
        new ApiRes(
            200,
            populatedProject,
            "project owner change successfully"
        )
    );
});



export {
    createProject,
    updateProject,
    deleteProject,
    addMemberInProject,
    addTeamInProject,
    removeMemberFromProject,
    removeTeamFromProject,
    changeProjectMemberRole,
    leaveProject,
    transferOwnershipOfProject,
}