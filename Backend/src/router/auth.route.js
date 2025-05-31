import { Router } from "express";
import { getUser, register, verifyOtp, resendOtp, login, updateUser, logOut, resetPasswordOtp, forgotPassword} from '../controllers/auth.control.js'
import { upload } from '../middleware/multer.middle.js';
import { verifyJwt } from '../middleware/auth.middle.js'


const authRouter = Router();

authRouter.route('/getUser').get(verifyJwt, getUser)

authRouter.route('/register').post(
   upload.single(
     'profilePhoto'
   ),
   register
);

authRouter.route('/verifyOtp').post(verifyOtp);

authRouter.route('/resendOtp').put(resendOtp);

authRouter.route('/login').post(login);

authRouter.route('/updateUser').put(verifyJwt,
   upload.single(
    'profilePhoto'
   ),
   updateUser
);

authRouter.route('/logOut').post(verifyJwt, logOut);

authRouter.route('/resetPasswordOtp').post(resetPasswordOtp)

authRouter.route('/forgotPassword').put(forgotPassword)


export default authRouter;