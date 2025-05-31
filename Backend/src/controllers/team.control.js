import mongoose from "mongoose";
import Invite from "../model/Invite.js";
import Organization from "../model/org.js";
import Project from "../model/project/Project.js";
import Team from "../model/Team.js";
import User from "../model/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { asyncFunc } from "../utils/asyncFunc.js";
import { sendEmail } from '../service/SendEmail.js';


const createTeam = asyncFunc(async(req, res)=>{
    const { teamName, description } = req.body;
    const org = req.org;
    const user = req.user;
    if(!teamName){
        throw new ApiError(
            400,
            "Team name is required"
        )
    };
    const teamTimelineHtml = `team <i>${teamName}</i> has been created by <b>${user.userName}</b>`
    const team = await Team.create({
        createdBy:user._id,
        inOrg:org._id,
        teamName,
        description: description || '',
        members:[
            {
                member:user._id,
                role:'admin'
            }
        ],
        timeline:[{
            text:teamTimelineHtml
        }]
    });
    if(!team){
        throw new ApiError(
            500,
            "Team creation failed due to a server error. Please try again later"
        )
    };
    user.inTeams.push({
        team:team._id,
        role:'admin'
    });
    await user.save();
    const timelineHtml = `<b>${user.userName}</b> created a new Team <i>${team.teamName}</i>`
    org.teams.push(team._id);
    org.timeline.push({
        text:timelineHtml
    });
    const populatedTeam = await team.populate([
        {
        path:'createdBy',
        select:'userName email profilePhoto'
       },{
        path:'members.member',
        select:'userName email profilePhoto'
       }
    ]);
    await org.save();
    return res.status(201)
    .json(
        new ApiRes(
            201,
            populatedTeam,
            "Team created successfully"
        )
    );
});

const updateTeam = asyncFunc(async(req, res)=>{
    const { teamName, description } = req.body;
    const user = req.user;
    const team = req.team;
    const teamTimelineHtml = `team name has been changed by <i>${user.userName}</i> from <b>${team.teamName}</b> to <b>${teamName}</b>.`
    if(teamName) team.teamName = teamName;
    if(description) teamName.description = description;
    team.timeline.push({
        text:teamTimelineHtml
    });
    await team.save();
    return res.status(200)
    .json(
        new ApiRes(
            200,
            team,
            "Team details updated successfully"
        )
    );
});

const deleteTeam = asyncFunc(async(req, res)=>{
    const team = req.team;
    const user = req.user;
    const { teamName } = req.body;
    if(teamName !== team.teamName){
        throw new ApiError(
            400,
            "Invalid Team name"
        )
    };
     if(user._id.toString() !== team.createdBy.toString()){
        throw new ApiError(
            403,
            "Only the team owner can delete the team"
        )
    };
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await User.updateMany(
          { 'inTeams.team': team._id },
          { $pull: 
            { inTeams: 
                { team: team._id } 
            } 
          },
          { session }
        );
        await Invite.deleteMany(
         {
             forTeam:team._id
         }
        ,{ session });
        await Project.updateMany(
            { teamsInclud: team._id },
            { $pull: 
                { teamsInclud: team._id } 
            },
            { session }
        );
        await Organization.updateMany(
            { teams: team._id },
            { $pull: 
                { teams: team._id } 
            },
            { session }
        );
        const org = await Organization.findById(team.inOrg).session(session);
        if (org) {
            org.timeline.push({
                text: `<b>${user.userName}</b> has deleted the team - <i>${team.teamName}</i>`
            });
            await org.save({ session });
        }
        await Team.findByIdAndDelete(team._id, { session })
        await session.commitTransaction(); 
        session.endSession();
        return res.status(200)
        .json(
            new ApiRes(
                200,
                null,
                "Team delete successfully"
            )
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(
            500,
            "Failed to delete team due to a server error, Please try again later"
        )
    }
});

const inviteMemberForTeam = asyncFunc(async(req, res)=>{
    const { email, asRoleof } = req.body;
    const inviteBy = req.user;
    const team = req.team;
    const org = req.org;
    if(!email){
        throw new ApiError(
            400,
            "Email is required"
        )
    };
    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(
            400,
            "User with this email does not Exists, make sure that user have an account"
        )
    };
    const isMemberInTeam = user.inTeams.some(
        (t) => t.team.toString() == team._id.toString()
    );
    if(isMemberInTeam){
        throw new ApiError(
            400,
            "This Member is already in team"
        )
    };
    const inviteExist = await Invite.findOne({
        email,
        forTeam:team._id,
        forOrg:org._id
    });
    if(inviteExist){
        throw new ApiError(
            400,
            "An invite has already been sent to this email for this Team. Please wait for the user to accept or decline it"
        )
    };
    const invite = await Invite.create({
        forTeam:team._id,
        forOrg:org._id,
        invitedBy:inviteBy._id,
        email,
        asRoleOf:asRoleof || "member",
    });
    const inviteLink = `${process.env.APP_URL}/invite/accept/${invite._id}`;
    sendEmail({
     to: email,
     subject: `You're Invited to Join the Team: ${team.teamName}`,
     html: `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px; background-color: #f9f9f9;">
         <h2 style="color: #333;">You're Invited to Join <span style="color: #4CAF50;">${team.teamName}</span> on DoFlow</h2>
         <p style="font-size: 16px; color: #555;">
           Hello,
         </p>
         <p style="font-size: 16px; color: #555;">
           <strong>${inviteBy.userName}</strong> has invited you to join the team <strong>${team.teamName}</strong> on <strong>DoFlow.app</strong> – a collaborative platform to manage tasks and projects efficiently.
         </p>
         <p style="font-size: 16px; color: #555;">Click the button below to accept the invitation:</p>
         <div style="text-align: center; margin: 20px 0;">
           <a href="${inviteLink}" style="display: inline-block; padding: 12px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>
         </div>
         <p style="font-size: 14px; color: #777;">
           If you did not expect this invitation, you can safely ignore this email.
         </p>
         <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
         <div style="margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
           <p style="font-size: 14px; color: #999999;">
             This is an automated message. Please do not reply directly to this email.
           </p>
           <p style="font-size: 14px; color: #999999;">
             — The ${org.orgName} Team
           </p>
         </div>
       </div>
     `
    });
    return res.status(200)
    .json(
        new ApiRes(
            200,
            invite,
            `Invitation fro the team - ${team.teamName} sent successfully `
        )
    );
});

const acceptInviteForTeam = asyncFunc(async(req, res)=>{
    const { inviteId } = req.params;
    const user = req.user;
    const invite = await Invite.findById(inviteId);
    if(!invite){
        throw new ApiError(
            404,
            "Invitation not found or may get accepted or declined"
        )
    };
    if(user.email !== invite.email){
        throw new ApiError(
            403,
            `This invitation is only for ${invite.email}`
        )
    };
    const team = await Team.findById(invite.forTeam);
    if(!team){
        throw new ApiError(
            404,
            "Team not Found"
        )
    };
    const org = await Organization.findById(invite.forOrg);
    if(!org){
        throw new ApiError(
            404,
            "Organization not found"
        )
    };
    const isMemberInTeam = team.members.some(
        (m) => m.member.toString() == user._id.toString()
    );
    const isMemberInOrg = org.members.some(
        (m) => m.member.toString() == user._id.toString()
    );
    if(isMemberInOrg && isMemberInTeam){
        throw new ApiError(
            400,
            "You are already part of this team"
        )
    };
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if(!isMemberInTeam){
            team.members.push({
                member:user._id,
                role:invite.asRoleOf || "member"
            });
            team.timeline.push({
                text: `<b>${user.userName}</b> has been joined the Team`
            })
            user.inTeams.push({
                team:team._id,
                role:invite.asRoleOf || "member"
            });
        };
        if(!isMemberInOrg){
            org.members.push({
                member:user._id,
                role:invite.asRoleOf || "member"
            });
            org.timeline.push({
                text:`<b>${user.userName}</b> has been joined the Organization`
            })
            user.inOrg.push({
                org:org._id,
                role: invite.asRoleOf || "member"
            });
        };
        await Promise.all([
            team.save(),
            org.save(),
            user.save(),
            Invite.findByIdAndDelete(invite._id,{ session })
        ], { session });
        await session.commitTransaction();
        session.endSession();
        return res.status(200)
        .json(
            new ApiRes(
                200,
                null,
                `Invitation accepted successfully for the team - ${team.teamName}`
            )
        )
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(
            500,
            "Failed to accept invitation due to server error, Please try again later."
        )
    }
});

const declineInviteForTeam = asyncFunc(async(req, res)=>{
    const { inviteId } = req.params;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(inviteId)) {
        throw new ApiError(400, "Invalid invite ID");
    }
    const invite = await Invite.findById(inviteId);
    if(!invite){
        throw new ApiError(
            400,
            "The Invitation is invalid"
        )
    };
    if(user.email !== invite.email){
        throw new ApiError(
            400,
            `This invitation is only for ${invite.email} you can't decline this.`
        )
    };
    await Invite.findByIdAndDelete(inviteId);
    return res.status(200)
    .json(
        new ApiRes(
            200,
            null,
            "Invite declined successfully"
        )
    )
});

const removeMemberFromTeam = asyncFunc(async(req, res)=>{
    const user = req.user;
    const team = req.team;
    const { memberId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
          throw new ApiError(400, "Invalid member ID");
    };
    const isMemberInTeam = team.members.some(
        (m)=> m.member.toString() == memberId.toString()
    );
    if(!isMemberInTeam){
        throw new ApiError(
            404,
            "The member is not part of this team"
        )
    };
    const isTeamOwner = team.createdBy.toString() == memberId.toString();
    if(isTeamOwner){
        throw new ApiError(
            403,
            "This is the owner of Team you can't remove owner"
        )
    };
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        team.members = team.members.filter(
          (m) => m.member.toString() !== memberId
        );
        const member = await User.findById(memberId).session(session);
        if(member){
           member.inTeams.pull({
             team:team._id
           });
           team.timeline.push({
              text:`<b>${user.userName}</b> has removed <b>${member.userName}</b> from the team <i>${team.teamName}</i>.`
           });
           await Promise.all([
             team.save({session}),
             member.save({session})
           ]);
            sendEmail({
              to: member.email,
              subject: `Notice: You've been removed from the team "${team.teamName}"`,
              html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9;">
                  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
                    <div style="background-color: #4F46E5; padding: 20px;">
                      <h2 style="color: #ffffff; margin: 0;">Team Management Notification</h2>
                    </div>
                    <div style="padding: 20px;">
                      <p style="font-size: 16px;">Hi <strong>${member.userName}</strong>,</p>
                      <p style="font-size: 16px;">
                        This is to inform you that you have been <strong style="color: #e53935;">removed</strong> from the team <strong>"${team.teamName}"</strong> by <strong>${user.userName}</strong>.
                      </p>
                      <p style="font-size: 16px;">
                        If you believe this action was made in error or have any concerns, please contact your organization administrator.
                      </p>
                      <p style="font-size: 16px;">We appreciate your contributions and wish you all the best in your future endeavors.</p>
                      <br/>
                      <p style="font-size: 16px;">Warm regards,</p>
                      <p style="font-size: 16px;"><strong>Team Admin - ${user.userName}</strong></p>
                    </div>
                    <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                      <p>Team Management | Do not reply to this email.</p>
                    </div>
                  </div>
                </div>
              `
            });
        }else{
           await team.save({ session })
        };
        const populatedTeam = await Team.findById(team._id).populate([
            {
                path:'createdBy',
                select:"userName email profilePhoto"
            },{
                path:'members.member',
                select:"userName email profilePhoto"
            }
        ])
        await session.commitTransaction();
        session.endSession();
        return res.status(200)
        .json(
            new ApiRes(
                200,
                populatedTeam,
                "Member removed successfully from the team"
            )
        )
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
         throw new ApiError(
            500,
            "Failed to remove member from the team due to a server error, Please try again later."
        )
    }
});

const changeTeamMemberRole = asyncFunc(async(req, res)=>{
    const { asRoleOf } = req.body;
    const { memberId } = req.params;
    const team = req.team;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new ApiError(400, "Invalid member ID");
    };
    if(team.createdBy.toString() == memberId.toString()){
        throw new ApiError(
            400,
            "This is the owner of the Team you can't change the role of owner"
        )
    };
    const member = team.members.find(
        (m) => m.member.toString() === memberId.toString()
    );
    await team.populate({
        path:'members.member',
        select:'userName'
    });
    if(!member){
        throw new ApiError(
            404,
            "This member is not part of this team"
        )
    };
    const validRoles = ['admin', 'moderator', 'leader', 'member', 'viewer'];
    if(!validRoles.includes(asRoleOf)){
        throw new ApiError(
            400,
            "Invalid role"
        )
    };
    await User.updateOne(
      { _id: memberId, 'inTeams.team': team._id },
      {
          $set: {
          'inTeams.$.role': asRoleOf
          }
      }
    );
    const oldRole = member.role;
    member.role = asRoleOf;
    team.markModified('members');
    const teamTimelineHtml =`<b>${user.userName}</b> changed the role of <strong>${member.member.userName}</strong> from <em>${oldRole}</em> to <em>${asRoleOf}</em>.`
    team.timeline.push({
        text:teamTimelineHtml
    });
    await team.save();
    const updatedTeamMemberRole = await team.populate([
        {
            path: 'members.member',
            select: 'userName email profilePhoto'
        },{
            path:'createdBy',
            select:'userName email profilePhoto'
        }
    ]);
    return res.status(200)
    .json(
        new ApiRes(
            200,
            updatedTeamMemberRole,
            "Member role updated successfully"
        )
    );
});

const leaveTeam = asyncFunc(async(req, res)=>{
    const team = req.team;
    const user = req.user;
    const isMemberInTeam = team.members.some(
        (m) => m.member.toString() === user._id.toString()
    );
    if(!isMemberInTeam){
        throw new ApiError(
            403,
            "You are not part of this team"
        )
    };
    const isOwner = team.createdBy.toString() == user._id.toString();
    if(isOwner){
        throw new ApiError(
            403,
            "you are owner of this team, you can't leave this team."
        )
    };
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        team.members.pull({
            member:user._id
        });
        team.timeline.push({
            text:`<b>${user.userName}</b> leave the team.`
        })
        user.inTeams.pull({
            team:team._id
        });
        await Promise.all([
            team.save(),
            user.save(),
        ],{ session });
        await session.commitTransaction();
        session.endSession();
        return res.status(200)
        .json(
            new ApiRes(
                200,
                null,
                "You successfully leave the team"
            )
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(
            500,
            "Failed to leave team due to server Error, please try again later"
        )
    };
});

const transferOwnershipOfTeam = asyncFunc(async(req, res)=>{
    const { memberId } = req.params;
    const user = req.user;
    const team = req.team;
     if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new ApiError(400, "Invalid member ID");
    };
    const isMemberInTeam = team.members.find(
        (m) => m.member.toString() == memberId.toString()
    );
    if(!isMemberInTeam){
        throw new ApiError(
            404,
            "The Member is not part of This team"
        )
    };
    if(user._id.toString() !== team.createdBy.toString()){
        throw new ApiError(
            403,
            "You are not the owner of this team"
        )
    };
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        team.createdBy = memberId;
        isMemberInTeam.role = 'admin';
        team.markModified('members');
        team.timeline.push({
            text:`<b>${user.userName}</b> transferred ownership of this team to <b>${isMemberInTeam.userName}</b>`
        })
        await team.save({ session });
        await User.updateOne(
            {
                _id: memberId,
                'inTeams.team': team._id
            },
            {
                $set: {
                    'inTeams.$.role': 'admin'
                }
            },
            { session }
        );
        const updatedTeam = await team.populate([
            {
                path: 'createdBy',
                select: 'userName email profilePhoto'
            },
            {
                path: 'members.member',
                select: 'userName email profilePhoto'
            }
        ]);
        await session.commitTransaction();
        session.endSession();
        return res.status(200)
        .json(
            new ApiRes(
                200,
                updatedTeam,
                "Ownership transferred successfully"
            )
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(
            500,
            "Failed to transferred ownership due to server error, please try again later."
        )
    }
});

export {
    createTeam,
    updateTeam,
    deleteTeam,
    inviteMemberForTeam,
    acceptInviteForTeam,
    declineInviteForTeam,
    removeMemberFromTeam,
    changeTeamMemberRole,
    leaveTeam,
    transferOwnershipOfTeam,
};