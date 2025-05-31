import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema(
    {
        forTeam:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Team',
        },
        forOrg:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Organization'
        },
        invitedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        email:{
            type:String,
            required:true,
            trim: true
        },
        asRoleOf:{
            type:String,
            enum: ['admin', 'moderator', 'leader', 'member', 'viewer'],
            default:'member'
        },
    },
    {
        timestamps:true
    }
);

const Invite = mongoose.model('Invite', inviteSchema);

export default Invite;