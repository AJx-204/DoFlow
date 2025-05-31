import User from '../model/User.js'
import { asyncFunc } from '../utils/asyncFunc.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiRes } from '../utils/ApiRes.js'
import { uploadOnCloudinary } from '../service/Cloudinary.js'
import crypto from 'crypto';
import { generateTokens } from '../utils/Token.js'
import { getCookieOptions } from '../const.js'
import { sendEmail } from '../service/SendEmail.js'


const getUser = asyncFunc(async(req, res)=>{
    const userId = req.user._id;
    if (!userId) {
      throw new ApiError(
        401, 
        'Unauthorized'
      )
    };
    const user = await User.findById(userId).select('-password -refreshToken -otp')
    .populate({
        path:"inOrg.org",
        sselect:"orgName"
    });
    if (!user) {
      throw new ApiError(
        404, 
        'User not found'
      );
    };
    if(!user.isVerified){
    return res.status(403)
     .json({
        success:false,
        needsVerification: true,
        message: 'Email is not verified. Please verify your email.',
        userEmail:user.email
     })
   };
    const { accessToken, refreshToken } = await generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();
    return res.status(200)
    .cookie('accessToken', accessToken, getCookieOptions('access'))
    .cookie('refreshToken', refreshToken, getCookieOptions('refresh'))
    .json(
        new ApiRes(
            200,
            user,
            "User authenticated successfully"
        )
    )
});

const register = asyncFunc(async(req, res)=>{
   const { userName, email, password } = req.body;
   if(!userName || !email || !password){
      throw new ApiError(
        400,
       'Please fill all the required information'
      )
   };
   const existingUser = await User.findOne({email});
   if(existingUser && existingUser.isVerified){
    throw new ApiError(
        409,
       'User already exists with this email'
    )
   };
   if (existingUser) {
      return res.status(400).json(
          new ApiRes(
              400,
              { userId: existingUser._id },
              'User already exists with this Email'
          )
      );
   };
   const profilePhotoUrl = req.file?.path;
   let profilePhoto = null;
   if(profilePhotoUrl){
       profilePhoto  = await uploadOnCloudinary(profilePhotoUrl)
   };
   const otpCode = crypto.randomInt(100000, 1000000).toString();
   const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 
   const user = await User.create({
    userName,
    email,
    password,
    profilePhoto:profilePhoto?.url || null,
    otp: {
      code: otpCode,
      expiresAt: otpExpiresAt,
    },
    isVerified: false,
   });
   sendEmail({
      to: email,
      subject: 'Verify your Email - OTP Code',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333;">Hello ${userName},</h2>
        <p style="font-size: 16px; color: #555;">
          Thank you for signing up. To complete your registration, please verify your email address by entering the OTP code below:
        </p>
        <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 6px; text-align: center;">
          <span style="font-size: 24px; font-weight: bold; color: #856404;">${otpCode}</span>
        </div>
        <p style="font-size: 14px; color: #777;">
          This OTP is valid for <strong>10 minutes</strong>. If you didn’t request this, you can safely ignore this email.
        </p>
        <p style="font-size: 14px; color: #777; margin-top: 30px;">
          Best regards,<br />
          <strong>Your App Team</strong>
        </p>
      </div>
      `
    });
   const createdUser = await User.findById(user._id)
   if(!createdUser){
    throw new ApiError(
        500,
        'Something Went Wrong while createing user'
    )
   };
   return res.status(201)
   .json(
     new ApiRes(
        201,
        {userEmail : createdUser.email},
        'User register successfuly, OTP has been sent to your email'
     )
   );
});

const verifyOtp = asyncFunc(async(req, res)=>{
    const { otpCode, email } = req.body;
    if(!email || !otpCode){
        throw new ApiError(
            400,
            "Email and OTP code are required"
        )
    };
    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(
            404,
            "user not found"
        )
    };
    if(!user.otp){
        throw new ApiError(
            404,
            "OTP not set"
        )
    };
    if(user.isVerified){
        throw new ApiError(
            400,
            "user is already verifyied"
        )
    };
    if(user.otp.code !== otpCode || new Date() > new Date(user.otp.expiresAt)){
        throw new ApiError(
            400,
            "Invalid OTP"
        )
    };
    user.isVerified = true;
    user.otp = undefined;
    await user.save();
    const { accessToken, refreshToken } = await generateTokens(user._id);
    const logedinUser = await User.findById(user._id).select(
     '-password -refreshToken -otp'
    ).populate({
        path:"inOrg.org",
        sselect:"orgName"
    });
    return res.status(200)
    .cookie('accessToken', accessToken, getCookieOptions('access'))
    .cookie('refreshToken', refreshToken, getCookieOptions('refresh'))
    .json(
        new ApiRes(
            200,
            logedinUser,
            'Email successfully verified. You can now log in.'
        )
    );
});

const resendOtp = asyncFunc(async(req, res)=>{
    const { email } = req.body;
    if(!email){
        throw new ApiError(
            400,
            "Email is required"
        )
    };
    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(
            404,
            "User with this Email not found"
        )
    };
    if(user.isVerified){
        throw new ApiError(
            400,
            "User is already verified"
        )
    };
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = {
        code:otpCode,
        expiresAt:otpExpiresAt
    };
    await user.save();
       await sendEmail({
      to: email,
      subject: 'Verify your Email - OTP Code',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333;">Hello ${user.userName},</h2>
        <p style="font-size: 16px; color: #555;">
          Thank you for signing up. To complete your registration, please verify your email address by entering the OTP code below:
        </p>
        <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 6px; text-align: center;">
          <span style="font-size: 24px; font-weight: bold; color: #856404;">${otpCode}</span>
        </div>
        <p style="font-size: 14px; color: #777;">
          This OTP is valid for <strong>10 minutes</strong>. If you didn’t request this, you can safely ignore this email.
        </p>
        <p style="font-size: 14px; color: #777; margin-top: 30px;">
          Best regards,<br />
          <strong>DoFlow.app</strong>
        </p>
      </div>
      `
    });
    return res.status(200)
    .json(
        new ApiRes(
            200,
            null,
            "OTP has been resent to your email"
        )
    );
});

const login = asyncFunc(async(req, res)=>{
   const { email, password } = req.body;
   if(!email || !password){
    throw new ApiError(
        400,
        'Please fill all the required information'
    )
   };
   const userExists = await User.findOne({email});
   if(!userExists){
    throw new ApiError(
        400,
        'User with this email dose not exists'
    )
   };
   const isPasswordValid = await userExists.isPasswordCorrect(password);
   if(!isPasswordValid){
    throw new ApiError(
        400,
        'Invalid Password'
    )
   };
   if(!userExists.isVerified){
    return res.status(403)
     .json({
        success:false,
        needsVerification: true,
        message: 'Email is not verified. Please verify your email.',
        userEmail:userExists.email
     })
   };
   const { accessToken, refreshToken } = await generateTokens(userExists._id);
   const logedinUser = await User.findById(userExists._id).select(
    '-password -refreshToken -otp'
   ).populate({
        path:"inOrg.org",
        sselect:"orgName"
    });
   return res.status(201)
   .cookie('accessToken', accessToken, getCookieOptions('access'))
   .cookie('refreshToken', refreshToken, getCookieOptions('refresh'))
   .json(
    new ApiRes(
        201,
        logedinUser,
        'User logged in successfuly'
    ) 
   );
});

const updateUser = asyncFunc(async(req, res)=>{
    const { userName } = req.body;
    const user = req.user
    const updateData = {}
    if(userName){
        updateData.userName = userName
    };
    if(req.file){
        const profilePhotoUrl = req.file?.path;
        const profilePhotoFromCloudinary = await uploadOnCloudinary(profilePhotoUrl);
        if(!profilePhotoFromCloudinary){
            throw new ApiError(
                500,
                 "Profile picture upload failed. Please try again"
            )
        };
        updateData.profilePhoto = profilePhotoFromCloudinary.url
    };
    const updatedUser = await User.findByIdAndUpdate(user._id,
        updateData, 
        {new:true}).select(
        "-password -refreshToken"
    ).populate({
        path:"inOrg.org",
        sselect:"orgName"
    });
    return res.status(200)
    .json(
        new ApiRes(
            200,
            updatedUser,
            "User details updated successfully"
        )
    );
});

const logOut = asyncFunc(async(req, res)=>{
    const user = req.user;
    await User.findByIdAndUpdate(user._id,{
        $set:{
            refreshToken:undefined
        }
    });
    return res.status(200)
    .clearCookie("accessToken", getCookieOptions('access'))
    .clearCookie("refreshToken", getCookieOptions('refresh'))
    .json(
        new ApiRes(
            200,
            null,
            "User logout successfully"
        )
    )
});

const resetPasswordOtp = asyncFunc(async(req, res)=>{
    const { email } = req.body;
    if(!email){
        throw new ApiError(
            400,
            "Email not found"
        )
    };
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.resetPasswordOtp = {
        code:otpCode,
        expiresAt:otpExpiresAt
    };
    await user.save();
    await sendEmail({
      to: email,
      subject: "Reset Your Password - OTP",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333333;">🔐 Reset Your Password</h2>
        <p style="font-size: 16px; color: #555555;">
          We received a request to reset your password. Use the OTP below to proceed.
        </p>
        <div style="margin: 24px 0; padding: 16px; background-color: #ffffff; border: 1px dashed #999999; border-radius: 6px; text-align: center;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #222222;">
            ${otpCode}
          </span>
        </div>
        <p style="font-size: 15px; color: #555555;">
          This OTP is valid for <strong>10 minutes</strong>. If you didn’t request this, please ignore this email or contact support.
        </p>
        <p style="font-size: 14px; color: #999999; margin-top: 32px;">
          Thanks,<br>The DoFlow.app Team
        </p>
      </div>
      `
    });
    return res.status(200)
    .json(
        new ApiRes(
            200,
            null,
            `OTP has been sent to ${email}`
        )
    );
});

const forgotPassword = asyncFunc(async(req, res)=>{
    const { otpCode, password, email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(
        404, 
        "User not found with this email"
      );
    }
    if(!otpCode || !password){
        throw new ApiError(
            400,
            "OTP and new password are required"
        )
    };
    if(!user.resetPasswordOtp){
        throw new ApiError(
            400,
            "No OTP found. please try again for reset password"
        )
    };
    if(new Date() > new Date(user.resetPasswordOtp.expiresAt)){
        user.resetPasswordOtp = undefined;
        await user.save();
        throw new ApiError(
            400,
            "OTP expired. Please try again."
        )
    };
    if(user.resetPasswordOtp.code !== otpCode){
        throw new ApiError(
            400,
            "Invalid OTP. please try again"
        )
    };
    user.password = password;
    user.resetPasswordOtp = undefined;
    await user.save();
    return res.status(200)
    .json(
        new ApiRes(
            200,
            null,
            "Password reset successfully"
        )
    );
});


export { getUser, register, verifyOtp, resendOtp, login, updateUser, logOut, resetPasswordOtp, forgotPassword}
