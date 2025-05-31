import React, { useState } from 'react'
import useUser from '../../Context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { Btn, Loader, Logo, Input } from '../../Components';
import { GoArrowLeft } from "react-icons/go";

const ResetPassword = () => {

    const navigate = useNavigate();

    const { user, resetPasswordOtp, forgotPassword, authError, setAuthError, updateLoading } = useUser();

    const [showEmailInput, setShowEmailInput] = useState(true);
    const [registerEmail, setRegisterEmail] = useState('')

    const [resetOpt, setResetOtp] = useState('');
    const [newPassword, setNewPassword] = useState('') 

    const sendOtp = async (e) => {
      e.preventDefault();
      const success = await resetPasswordOtp(registerEmail);
      if(success){
        setShowEmailInput(false);
      }
    };

    const verifyResetOtp = async (e) => {
        e.preventDefault();
        const success = await forgotPassword(resetOpt, newPassword, registerEmail);
        if(success){
          if(!user){
            setAuthError('')
            navigate('/auth')
          }else{
            navigate('/profile')
          }
        }
    };
    
  return (
    <>
    {showEmailInput ? (
    <div className='flex flex-col gap-1'>
     <div
      onClick={()=>navigate(`/profile/${user.userName}`)}
      className='flex gap-2 items-center hover:gap-0 hover:-ml-2 p-2 font-medium w-[max-content]'
      >
        <GoArrowLeft size={18}/>
        Back
     </div>
     <div
      className='flex flex-col items-center gap-6 w-80 p-6 rounded-lg border 
     border-zinc-300 dark:border-zinc-800 shadow-md
     bg-white dark:bg-zinc-950' 
      >
       <Logo/>
       <div
        className='flex flex-col items-center'
        >
         <span
          className='text-xl'
          >
           Forgot Password
         </span>
         <span
          className='text-zinc-500 text-sm'
          >
           Enter your register email to get OTP to reset the password
         </span>
        </div>
        <form
        onSubmit={sendOtp}
         className='flex flex-col w-full items-start gap-4 text-sm'
         >
           <Input
             className={"flex flex-col w-full gap-0.5"}
             htmlFor={'registerEmail'}
             label={"Email"}
             labelClassName={"ml-0.5 text-[12px] font-medium"}
             type={"email"}
             id={'registerEmail'}
             onChange={(e)=>setRegisterEmail(e.target.value)}
             placeholder={"Enter Email here . . . ."}
             inputClassName={'bg-zinc-100 dark:bg-zinc-900 focus:border-blue-500/30 focus:bg-blue-500/10 outline-0 placeholder:text-zinc-500 placeholder:font-light font-medium p-2 rounded border border-zinc-300 dark:border-zinc-800'}
             required={true}
            />
            { authError && <span
              className='ml-0.5 text-sm text-red-500 items-start'
              >
               {authError}
             </span>
            }
            <div
             className='flex w-full justify-center mt-4'
             >
             {updateLoading ? (
               <Loader
                 size='15px'
                 color='blue'
                 />
             ):(
              <Btn
                text={"Get OTP"}
                className={"px-3 py-1 bg-blue-500 hover:bg-blue-700 rounded shadow-md text-white text-sm"}
              />
             )}
            </div>
         </form>
     </div>
    </div>
    ):(
    <div className='flex flex-col gap-1'>
     <div
      onClick={()=>setShowEmailInput(true)}
      className='flex gap-2 items-center hover:gap-0 hover:-ml-2 p-2 font-medium w-[max-content]'
      >
        <GoArrowLeft size={18}/>
        Back
     </div>
     <div
      className='flex flex-col items-center gap-6 w-80 p-6 rounded-lg border 
     border-zinc-300 dark:border-zinc-800 shadow-md
     bg-white dark:bg-zinc-950' 
      >
       <Logo/>
       <div
        className='flex flex-col items-center'
        >
         <span
          className='text-xl'
          >
           Forgot Password
         </span>
         <span
          className='text-sm text-zinc-500'
          >
            verify email by OTP that we sent on your email address .
         </span>
       </div>
       <form
        onSubmit={verifyResetOtp}
        className='flex flex-col gap-4 text-sm w-full'
        >
          <Input
            className={"flex flex-col w-full gap-0.5"}
            htmlFor={'otp'}
            label={"OTP"}
            labelClassName={"ml-0.5 text-[12px] font-medium"}
            type={"text"}
            value={resetOpt}
            id={'otp'}
            onChange={(e)=>setResetOtp(e.target.value)}
            placeholder={"Enter OTP here . . . ."}
            inputClassName={'bg-zinc-100 dark:bg-zinc-900 focus:border-blue-500/30 focus:bg-blue-500/10 outline-0 placeholder:text-zinc-500 placeholder:font-light font-medium p-2 rounded border border-zinc-300 dark:border-zinc-800'}
            required={true}
           />
           <Input
            className={"flex flex-col w-full gap-0.5"}
            htmlFor={'Newpassword'}
            label={"New password"}
            labelClassName={"ml-0.5 text-[12px] font-medium"}
            type={"text"}
            value={newPassword}
            id={'Newpassword'}
            onChange={(e)=>setNewPassword(e.target.value)}
            placeholder={"Enter new password"}
            inputClassName={'bg-zinc-100 dark:bg-zinc-900 focus:border-blue-500/30 focus:bg-blue-500/10 outline-0 placeholder:text-zinc-500 placeholder:font-light font-medium p-2 rounded border border-zinc-300 dark:border-zinc-800'}
            required={true}
           />
          { authError && <span
           className='ml-0.5 text-sm text-red-500'
           >
            {authError}
          </span>}
          <div
           className='flex justify-center mt-4' 
           >
           {updateLoading ? (
             <Loader
              size='15px'
              color='blue'
              />
           ):(
             <Btn
              text={"Reset"}
              className={"px-4 py-1 bg-blue-500 text-white rounded shadow-md hover:bg-blue-700 cursor-pointer"}
              />
           )}
          </div>
       </form>
     </div>
    </div>
    )}
   </>
  )
}

export default ResetPassword