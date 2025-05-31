import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
    {
        userName:{
            type:String,
            required:true,
            trim: true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            trim: true
        },
        password:{
            type:String,
            required:true,
            trim: true
        },
        profilePhoto:{
            type:String,  // cloudinary url
        },
        inTeams:[{
            team:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Team'
             },
             role:{
                type: String,
                enum: ['admin', 'moderator', 'leader', 'member', 'viewer'],
                default:'member'
             }
        }],
        inProject:[{
            project:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Project'
            },
            role:{
                type: String,
                enum: ['admin', 'moderator', 'leader', 'member', 'viewer'],
                default:'member',
             }
        }],
        inOrg:[{
            org:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Organization'
            },
            role:{
                type: String,
                enum: ['admin', 'moderator', 'leader', 'member', 'viewer'],
                default:'member',
            }
        }],
        otp: {
           code: { 
             type: String 
           },
           expiresAt: { 
             type: Date 
           },
        },
        isVerified: {
           type: Boolean,
           default: false,
        },
        resetPasswordOtp: {
          code: {
            type:String
          },
          expiresAt:{ 
            type:Date
          },
        },
        lastVisit:{
            type:Date
        },
        refreshToken:{
            type: String
        }
    },
    {
        timestamps:true
    }
);

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
};


userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
      {
          _id: this._id,
          email: this.email,
          userName: this.userName,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
      }
    )
};

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
      )
};


const User = mongoose.model('User',userSchema);

export default User;