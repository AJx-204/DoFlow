import mongoose from "mongoose";

const organizationSchema =  new mongoose.Schema(
    {
        createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        orgProfilePhoto:{
            type:String,
        },
        orgName:{
            type:String,
            required:true,
            trim:true
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        projects:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Project"
            }
        ],
        teams:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Team"
            }
        ],
        members:[
            {
                member: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User",
                  required: true,
                },
                role: {
                  type: String,
                  enum: ['admin', 'moderator', 'leader', 'member', 'viewer'],
                  default: "member",
                },
                joinedAt: {
                  type: Date,
                  default: Date.now,
                },
            },
        ],
        timeline:[
            {
                text: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true
    }
);

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;