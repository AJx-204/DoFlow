import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
    {
       createdBy:{
           type:mongoose.Schema.Types.ObjectId,
           ref:'User',
           required:true
       },
       sectionName:{
           type:String,
           required:true,
           trim: true,
       },
       description:{
           type:String,
           trim: true,
           default:""
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
          }
       ],
       inProject:{
          type:mongoose.Schema.Types.ObjectId,
          ref:'Project'
       },
       status:{
           type:String,
           enum:['New Added', 'In Progress','Under Review', 'Completed'],
           default:'New Added'
       },
       deadline:{
           type:Date
       },
       tasks:[
           {
              type:mongoose.Schema.Types.ObjectId,
              ref:'Task'
           },
       ]
    },
    {
        timestamps:true
    }
);

const Section = mongoose.model('Section', sectionSchema)

export default Section;
