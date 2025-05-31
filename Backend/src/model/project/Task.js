import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        title:{
            type:String,
            required:true,
            trim: true
        },
        description:{
            type:String,
            trim: true,
            default:''
        },
        priority:{
            type:String,
            enum:['Low', 'Medium', 'High', 'Very High'],
            default:'Meduim'
        },
        status:{
            type:String,
            enum:['New Task', 'In Progress', 'Under Review', 'Completed'],
            default:'New Task'
        },
        assignedToTeam:[
           {
              type:mongoose.Schema.Types.ObjectId,
              ref:'Team',
           }
        ],
        assignedToMember:[
           {
               type:mongoose.Schema.Types.ObjectId,
               ref:'User'
           },
        ],
        inSection: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Section',
            required: true
        },
        subTasks:[  
            {
                addedBy:{
                  type:mongoose.Schema.Types.ObjectId,
                  ref:'User',
                  required:true,
                  trim: true
                },
                title:{
                    type:String,
                    required:true,
                    trim: true
                },
                description:{
                    type:String,
                    trim: true,
                    default:""
                },
                isCompleted:{
                    type:Boolean,
                    default:false
                }
            },
        ],
        comments:[
           {
              addedBy:{
                  type:mongoose.Schema.Types.ObjectId,
                  ref:'User',
                  required:true,
                  trim: true
              },
              text:{
                type:String,
                required:true,
                trim: true
              },
              addedAt:{
                type:Date,
                default:Date.now
              }
           },
        ],
        links:[
           {
              addedBy:{
                  type:mongoose.Schema.Types.ObjectId,
                  ref:'User',
                  required:true,
                  trim: true
              },
              label:{
                 type:String,
                 required:true,
                 trim: true
              },
              url:{
                 type:String,
                 required:true,
                 trim: true
              },
              addedAt:{
                type:Date,
                default:Date.now
              }
           },
        ],
        attachments:[
            {
                addedBy:{
                  type:mongoose.Schema.Types.ObjectId,
                  ref:'User',
                  required:true,
                }, 
                fileName:{
                    type:String,
                    trim: true
                },
                fileUrl:{
                    type:String,
                    required:true,
                    trim: true
                },
                addedAt:{
                    type:Date,
                    default:Date.now
                }
            },
        ],
        deadline:{
            type:Date
        },
    },
    {
        timestamps:true
    }
);

const Task = mongoose.model('Task', taskSchema)

export default Task;