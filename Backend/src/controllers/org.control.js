import mongoose from "mongoose";
import Invite from "../model/Invite.js";
import Organization from "../model/org.js";
import Project from "../model/project/Project.js";
import Team from "../model/Team.js";
import User from "../model/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { asyncFunc } from "../utils/asyncFunc.js";
import { sendEmail } from '../service/SendEmail.js'
import { uploadOnCloudinary } from '../service/Cloudinary.js'


const createOrg = asyncFunc(async(req, res)=>{
    const { orgName, description } = req.body;
    const user = req.user;
    if(!orgName){
        throw new  ApiError(
            400,
            "Organization Name is required"
        )
    };
    const orgProfilePhotoUrl = req.file?.path;
    let orgProfilePhoto = null;
    if(orgProfilePhotoUrl){
        orgProfilePhoto  = await uploadOnCloudinary(orgProfilePhotoUrl)
    };
    const timelineHtml = `the organization <b>${orgName}</b> has been created by <b>${user.userName}</b>.`
    const newOrg = await Organization.create({
        createdBy:user._id,
        orgName,
        orgProfilePhoto:orgProfilePhoto?.url || null,
        description:description || "",
        members:[{
            member:user._id,
            role:"admin",
        }],
        timeline:[{
            text:timelineHtml,
        }]
    });
    if(!newOrg){
        throw new ApiError(
            400,
            "Something went wrong while creating the organization"
        )
    };
    await User.findByIdAndUpdate(user._id, {
        $push:{
            inOrg:{
                org:newOrg._id,
                role:"admin"
            }
        }
    });
    const populatedOrg = await Organization.findById(newOrg._id).populate([
        {
            path:'createdBy',
            select:'userName email profilePhoto'
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
            populatedOrg,
            "Organization created successfully"
        )
    );
});

const updateOrg = asyncFunc(async(req, res)=>{
    const user = req.user;
    const { orgName, description } = req.body;
    const org = req.org;
    const orgProfilePhotoUrl = req.file?.path;
    let orgProfilePhoto = null;
    if(orgProfilePhotoUrl){
        orgProfilePhoto  = await uploadOnCloudinary(orgProfilePhotoUrl)
    };
    const timelineHtml = `<b>${user.userName}</b> changed the organization name from <i>${org.orgName}</i> to <strong>${orgName}</strong> .`
    org.timeline.push({
        text:timelineHtml,
    });
    if(orgName) org.orgName = orgName
    if(description) org.description = description
    if(orgProfilePhoto) org.orgProfilePhoto = orgProfilePhoto?.url || null
    const updatedOrg = await org.save();
    return res.status(200)
    .json(
        new ApiRes(
            200,
            updatedOrg,
            "Organization's details updated successfully"
        )
    );
});

const deleteOrg = asyncFunc(async(req, res)=>{
    const { orgName } = req.body;
    const user = req.user
    const org = req.org;
    if(orgName.trim() !== org.orgName){
        throw new ApiError(
            403,
            "Invalid Organization name"
        )
    };
    if(user._id.toString() !== org.createdBy.toString()){
        throw new ApiError(
            403,
            "Only the organization owner can delete the organization"
        )
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await User.updateMany(
            {
                "inOrg.org":org._id
            },
            {
                $pull:{
                    inOrg:{
                        org:org._id
                    },
                    inProject:{
                        project:{
                            $in:org.projects
                        }
                    },
                    inTeams:{
                        team:{
                            $in:org.teams
                        }
                    }
                }
            },{ session }
        );
        await Invite.deleteMany({
           $or:[
              {
                  forOrg:org._id
              },
              {
                  forTeam:{
                    $in:org.teams
                  }
              }
           ]
        },{ session });
        await Team.deleteMany({
            inOrg:org._id
        },{ session });
        await Project.deleteMany({
            inOrg:org._id
        },{ session });
        await Organization.findByIdAndDelete(
            org._id,
            { session }
        );
        await session.commitTransaction();
        session.endSession();
        return res.status(200)
        .json(
           new ApiRes(
              200,
              null,
              "Organization deleted successfully"
           )
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(
            500,
            "Failed to delete organization due to a server error, Please try again later"
        )
    };
});

const inviteMember = asyncFunc(async(req, res)=>{
    const { email, asRoleOf } = req.body;
    const org = req.org;
    const invitedBy = req.user;
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
    const isMember = user.inOrg.some(
        (o) => o.org.toString() === org._id.toString()
    );
    if(isMember){
        throw new ApiError(
            400,
            "This user is already part of the organization"
        )
    };
    const inviteExist = await Invite.findOne({
        email,
        forOrg:org._id,
    });
    if(inviteExist){
        throw new ApiError(
            400,
            "An invite has already been sent to this email for this organization. Please wait for the user to accept or decline it"
        )
    };
    const invite = await Invite.create({
        forOrg:org._id,
        invitedBy:invitedBy._id,
        email,
        asRoleOf:asRoleOf || 'member',
    });
    const inviteLink = `${process.env.APP_URL}/invite/accept/${invite._id}`;
    sendEmail({
      to: email,
      subject: `You're invited to join ${org.orgName}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 24px; border-radius: 8px;">
        <h2 style="color: #2c3e50;">You've Been Invited to Join ${org.orgName}</h2>
        <p style="font-size: 16px; color: #333;">
          Hello,
        </p>
        <p style="font-size: 16px; color: #333;">
          <strong>${invitedBy.userName}</strong> has invited you to join the organization <strong>${org.orgName}</strong> as a <strong style="color: #1abc9c;">${asRoleOf || "member"}</strong>.
        </p>
        <p style="font-size: 16px; color: #333;">
          Click the button below to accept the invitation:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="padding: 12px 24px; background-color: #1abc9c; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Accept Invitation
          </a>
        </div>
        <p style="font-size: 14px; color: #666;">
          If the button doesn't work, copy and paste the link below into your browser:
        </p>
        <p style="word-break: break-all; font-size: 13px; color: #888;">
          ${inviteLink}
        </p>
        <hr style="margin-top: 40px;" />
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          This invitation was sent by ${invitedBy.email}. If you weren't expecting this email, you can safely ignore it.
        </p>
      </div>
      `
    });
    return res.status(200)
    .json(
        new ApiRes(
            200,
            invite,
            "invitation sent successfully"
        )
    );
});

const acceptInviteForOrg = asyncFunc(async(req, res)=>{
    const user = req.user;
    const { inviteId } = req.params;
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
            `This invitation is only for ${invite.email}`
        )
    };
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await Invite.findByIdAndDelete(invite._id,{ session });
        await User.findByIdAndUpdate(user._id,{
            $addToSet:{
                inOrg:{
                    org:invite.forOrg,
                    role:invite.asRoleOf
                }
            }
        },{ session });
        const timelineHtml = `<b>${user.userName}</b> has joined the organization as a <i>${invite.asRoleOf}</i>`;
        const org = await Organization.findByIdAndUpdate(invite.forOrg,{
            $addToSet:{
                members:{
                    member:user._id,
                    role:invite.asRoleOf
                },
            },
             $push: {
                timeline: {
                    text: timelineHtml,
                }
            }
        },{new:true, session }).populate([
            {
                path:'createdBy',
                select:'userName email profilePhoto'
            },
            {
                path:'members.member',
                select:'userName email profilePhoto'
            }
        ]);
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json(
            new ApiRes(
                200,
                null,
                 `Invitation accepted successfully for the organization - ${org.orgName} `
            )
        );
    } catch (error) {
        await session.commitTransaction();
        session.endSession();
        throw new ApiError(
            500,
            "Failed to accept invitation due to a server error, Please try again later"
        )
    }
});

const declineInviteForOrg = asyncFunc(async(req, res)=>{
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

const removeMemberFromOrg = asyncFunc(async(req, res)=>{
    const { memberId } = req.params;
    const org = req.org;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new ApiError(400, "Invalid member ID");
    };
    const isMemberInOrg = org.members.some(
        (m)=> m.member.toString() == memberId.toString()
    );
    if(!isMemberInOrg){
        throw new ApiError(
            400,
            "This member is not part of this Organization"
        )
    };
    const isOwner = org.createdBy.toString() == memberId.toString();
    if(isOwner){
        throw new ApiError(
            400,
            "This is the owner of Organization you can't remove owner"
        )
    };
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const orgTeams = await Team.find({
            inOrg: org._id
        },{_id:1}).session(session);
        const orgProjects = await Project.find({
            inOrg: org._id
        },{_id: 1}).session(session);
        const removedUser = await User.findByIdAndUpdate(memberId,{
            $pull:{
                inOrg:{
                    org:org._id
                },
                 inTeams:{
                    team: { $in: orgTeams.map(t => t._id) } 
                },
                inProject:{
                    project:{ $in: orgProjects.map(p => p._id) }
                }
            }
        },{ new: true, session });
         await Team.updateMany(
            { inOrg: org._id },
            { $pull: 
                { members:{ 
                        member:memberId 
                    }
                } 
            },
            { session }
        );
        await Project.updateMany(
            { inOrg: org._id },
            { $pull: 
                { members:{ 
                       member: memberId
                    } 
                } 
            },
            { session }
        );
        const timelineHtml = `<b>${user.userName}</b> has removed <b>${removedUser.userName}</b> from the organization <strong>${org.orgName}</strong>.`
        const updatedOrg = await Organization.findByIdAndUpdate(org._id,{
            $pull:{
                members:{
                    member:memberId
                }
            },
            $push:{
                timeline:{
                    text:timelineHtml,
                }
            }
        },{new:true, session}).populate([
            {
              path: 'members.member',
              select: 'userName email profilePhoto'
            },
            {
              path: 'createdBy',
              select: 'userName email profilePhoto'
            }
        ]);
        sendEmail({
          to: removedUser.email,
          subject: `Removed from ${org.orgName}`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e0e0e0; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
              <h2 style="color: #e74c3c; margin-bottom: 16px;">🚫 Removed from ${org.orgName}</h2>
              <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                Hello <strong>${removedUser.userName}</strong>,
              </p>
              <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                We want to inform you that you have been removed from the organization <strong>${org.orgName}</strong> by one of the organization administrators.
              </p>
              <p style="font-size: 15px; color: #666666; line-height: 1.6;">
                If you believe this was a mistake or have any questions, feel free to contact your team admin or support.
              </p>
              <div style="margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
                <p style="font-size: 14px; color: #999999;">
                  This is an automated message. Please do not reply directly to this email.
                </p>
                <p style="font-size: 14px; color: #999999;">
                  — The ${org.orgName} Team
                </p>
              </div>
            </div>
          `,
        });
        await session.commitTransaction();
        session.endSession();
        return res.status(200)
        .json(
            new ApiRes(
                200,
                updatedOrg,
                "Member removed successfully from the organization and all associated teams/projects"
            )
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(
            500,
            "Failed to remove member from the organization due to a server error, Please try again later."
        )
    };
});

const changeOrgMemberRole = asyncFunc(async(req, res)=>{
    const org = req.org;
    const user = req.user;
    const { memberId } = req.params;
    const { asRoleOf } = req.body;
     if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new ApiError(400, "Invalid member ID");
    };
    const isOwner = org.createdBy.toString() === memberId.toString();
    if(isOwner){
        throw new ApiError(
            400,
            "This member is owner of Organization you can't change the role for owner"
        )
    };
    const member = org.members.find(
        (m) => m.member.toString() === memberId.toString()
    );
    await org.populate({
        path:'members.member',
        select:'userName'
    })
    if(!member){
        throw new ApiError(
            400,
            "This member is not part of this Organization"
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
      { _id: memberId, 'inOrg.org': org._id },
      {
        $set: {
          'inOrg.$.role': asRoleOf
        }
      }
    );
    const oldRole = member.role;
    member.role = asRoleOf;
    org.markModified('members');
    const timelineHtml =`<b>${user.userName}</b> changed the role of <strong>${member.member.userName}</strong> from <em>${oldRole}</em> to <em>${asRoleOf}</em>.`
    org.timeline.push({
         text:timelineHtml,
    })
    await org.save();
    const updatedOrgMemberRole = await org.populate([{
       path: 'members.member',
       select: 'userName email profilePhoto'
    },{
       path:'createdBy',
       select:'userName email profilePhoto'
    }]);
    return res.status(200)
    .json(
        new ApiRes(
            200,
            updatedOrgMemberRole,
            "Member role updated successfully"
        )
    );
});

const leaveOrg = asyncFunc(async(req, res)=>{
    const org = req.org;
    const user = req.user;
    const isMemberInOrg = org.members.some(
        (m) => m.member.toString() == user._id.toString()
    );
    if(!isMemberInOrg){
        throw new ApiError(
            400,
            "You are not a part of this organization"
        )
    };    
    const isOwner = org.createdBy.toString() == user._id.toString();
    if(isOwner){
        throw new ApiError(
            400,
            "You can not leave the organization as you are the owner"
        )
    };
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const orgTeams = await Team.find({
            inOrg: org._id
        },{_id:1}).session(session);
        const orgProjects = await Project.find({
            inOrg: org._id
        },{_id: 1}).session(session);
        const timelineHtml =`<b>${user.userName}</b> left the organization`
        await Organization.findByIdAndUpdate(org._id, {
            $pull: {
                members: { 
                    member: user._id 
                },
            },
            $push:{
                timeline:{
                    text:timelineHtml,
                }
            }
        },{ session });
        await User.findByIdAndUpdate(user._id, {
            $pull: {
                inOrg: { 
                    org: org._id 
                },
                inTeams:{
                    team: { $in: orgTeams.map(t => t._id) } 
                },
                inProject:{
                    project:{ $in: orgProjects.map(p => p._id) }
                }
            },
        },{ session });
        await Team.updateMany(
            { inOrg: org._id },
            { $pull: 
                { members:{ 
                        member:user._id 
                    }
                } 
            },
            { session }
        );
        await Project.updateMany(
            { inOrg: org._id },
            { $pull: 
                { members:{ 
                       member: user._id 
                    } 
                } 
            },
            { session }
        );
        await session.commitTransaction();
        session.endSession();
        return res.status(200)
        .json(
            new ApiRes(
                200,
                null,
                "You have successfully left the organization and all associated teams/projects"
            )
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(
            500,
            "Failed to leave organization due to a server error, Please try again later."
        )
    };
});

const transferOwnershipOfOrg = asyncFunc(async(req, res)=>{
    const org = req.org;
    const { memberId } = req.params;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new ApiError(400, "Invalid member ID");
    };
    const isOwner = org.createdBy.toString() == user._id.toString();
    if(!isOwner){
        throw new ApiError(
            400,
            "You are not the owner of this organization"
        )
    };
    if(memberId.toString() == org.createdBy.toString()){
        throw new ApiError(
            400,
            "This is alredy owner of this Organization"
        )
    };
    const isMemberInOrg = org.members.some(
        (m) => m.member.toString() == memberId.toString()
    );
    if(!isMemberInOrg){
        throw new ApiError(
            400,
            "This member not part of this Organization"
        )
    };
  
    await User.bulkWrite([
        {
            updateOne:{
                filter:{
                    _id:memberId,
                    'inOrg.org':org._id
                },
                update:{
                    $set:{
                        'inOrg.$.role':'admin'
                    }
                }
            }
        },{
            updateOne:{
                filter:{
                    _id:user._id,
                    'inOrg.org':org._id
                },
                update:{
                    $set:{
                        'inOrg.$.role':'moderator'
                    }
                }
            }
        }
    ]);
   
    org.createdBy = memberId;
    org.members = org.members.map((m) => {
       const memberIdStr = m.member.toString();
       if (memberIdStr === memberId.toString()) {
           return { ...m._doc, role: 'admin' };
       }
       if (memberIdStr === user._id.toString()) {
           return { ...m._doc, role: 'moderator' };
       }
       return m._doc;
    });
    const newOwner = await User.findById(memberId);
    const timelineHtml = `<b>${user.userName}</b> transferred the ownership of the organization to <b>${newOwner.userName}</b>`;
    org.timeline.push({
        text:timelineHtml
    })
    await org.save();
    sendEmail({
      to: newOwner.email,
      subject: `You are now the owner of ${org.orgName}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e0e0e0; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
          <h2 style="color: #2ecc71;">🎉 Congratulations! You are now the owner of ${org.orgName}</h2>
          <p style="font-size: 16px; color: #333333; line-height: 1.6;">
            Hello <strong>${newOwner.userName}</strong>,
          </p>
          <p style="font-size: 16px; color: #333333; line-height: 1.6;">
            We are pleased to inform you that you are now the owner of the organization <strong>${org.orgName}</strong>. You have full control over the organization settings and management.
          </p>
          <p style="font-size: 15px; color: #666666; line-height: 1.6;">
            If you have any questions or need assistance, feel free to reach out to the previous owner or your admin team.
          </p>
          <div style="margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
            <p style="font-size: 14px; color: #999999;">
              This is an automated message. Please do not reply directly to this email.
            </p>
            <p style="font-size: 14px; color: #999999;">
              — The ${org.orgName} Team
            </p>
          </div>
        </div>
      `,
    });
    const populatedOrg = await org.populate([
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
            populatedOrg,
            "Ownership successfully transferred"
        )
    );
}); 

export {
    createOrg,
    updateOrg,
    deleteOrg,
    inviteMember,
    acceptInviteForOrg,
    declineInviteForOrg,
    removeMemberFromOrg,
    changeOrgMemberRole,
    leaveOrg,
    transferOwnershipOfOrg,
}