import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        inOrg:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Organization'
        },
        projectName:{
            type:String,
            required:true,
            trim: true
        },
        description:{
            type:String,
            trim: true,
            default:''
        },
        teams:[
           {
              type:mongoose.Schema.Types.ObjectId,
              ref:'Team',
           }
        ],
        members: [
           {
             member: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'User',
               required: true
             },
             role:{
               type: String,
               enum: ['admin', 'moderator', 'leader', 'member', 'viewer'],
               default:'member'
             },
             joinedAt: {
               type: Date,
               default: Date.now
             }
           }
         ],
        projectSections:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:'Section'
            }
        ],
        chatRoom:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'ChatRoom'
        },
        deadline:{
            type:Date
        },
    },
    {
        timestamps:true
    }
);

const Project = mongoose.model('Project', projectSchema)

export default Project;