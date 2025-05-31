import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema(
    {
        createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        inOrg:{
               type:mongoose.Schema.Types.ObjectId,
               ref:"Organization"  
        },
        teamName:{
            type:String,
            required:true,
            trim: true
        },
        description:{
            type:String,
            trim: true
        },
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
        projects: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Project'
            },
        ],
        timeline:[
          {
            text:{
              type:String,
              required: true
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
          }
        ]
    },
    {
        timestamps:true
    }
);

const Team = mongoose.model('Team', teamSchema);

export default Team;