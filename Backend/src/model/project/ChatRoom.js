import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
    {
        forProject:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Project',
            required:true
        },
        createdBy:{
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true 
        },
        chatMembers:[
            {
                member:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                joinedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        messages:[
            {
                sender:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                textMessage:{
                    type: String,
                    required: true
                },
                sentAt:{
                    type:Date,
                    default:Date.now
                },
                attachments:{
                    fileName:{
                        type:String
                    },
                    fileUrl:{
                        type:String,
                        required:true
                    },
                    uploadedAt:{
                        type:Date,
                        default:Date.now
                    }
                }
            }
        ]
    },
    {
        timestamps:true
    }
);

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema)

export default ChatRoom;