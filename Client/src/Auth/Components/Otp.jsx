import { useEffect, useState } from 'react'
import { Btn, Logo, Input, Loader } from '../../Components/index.js';
import useUser from '../../Context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';
import useOrg from '../../Context/OrgContext.jsx';

const Otp = () => {

  const navigate = useNavigate();

  const { orgData } = useOrg();

  const {
    userEmail,
    authError,
    verifyOtp,
    setAuthError,
    resendOtp,
    authLoding
  } = useUser();

  useEffect(()=>{
    if(!userEmail){
        navigate('/auth')
    }
  },[userEmail]);
  
  const [ otp, setOtp ] = useState('');
  const [ canResend, setCanResend ] = useState(true)

  const verifyUser = async (e) => {
    e.preventDefault();
    setAuthError('')
    const success = await verifyOtp(otp, userEmail);
    if(success){
       if(orgData){
          navigate(`/${orgData.orgName}`)
        }else{
          navigate('/profile')
        }
    }
  };

  const ResendOtp = () => {
    setOtp('')
    resendOtp(userEmail)
    setCanResend(false);
    setTimeout(()=>{
      setCanResend(true)
    },10000)
  };

  return (
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
          Verify Email
        </span>
        <span
         className='text-sm text-zinc-500'
         >
           verify email by OTP that we sent on your email address <span
           className='text-blue-500'
           >
            {userEmail ? userEmail : "Email" }
        </span>
        </span>
      </div>
      <form
       onSubmit={verifyUser}
       className='flex flex-col gap-8 text-sm w-full'
       >
          <Input
            className={"flex flex-col w-full gap-0.5"}
            htmlFor={'otp'}
            label={"OTP"}
            labelClassName={"ml-0.5 text-[12px] font-medium"}
            type={"text"}
            value={otp}
            id={'otp'}
            onChange={(e)=>setOtp(e.target.value)}
            placeholder={"Enter OTP here . . . ."}
            inputClassName={'bg-zinc-100 dark:bg-zinc-900 focus:border-blue-500/30 focus:bg-blue-500/10 outline-0 placeholder:text-zinc-500 placeholder:font-light font-medium p-2 rounded border border-zinc-300 dark:border-zinc-800'}
            required={true}
           />
          { authError && <span
           className='ml-0.5 text-sm text-red-500'
           >
            {authError}
          </span>}
         <div
          className='flex justify-center' 
          >
          {authLoding ? (
            <Loader
             size='15px'
             color='blue'
             />
          ):(
            <Btn
             text={"verify OTP"}
             className={"px-4 py-1 bg-blue-500 text-white rounded shadow-md hover:bg-blue-700 cursor-pointer"}
             />
          )}
          
         </div>
      </form>
      <div
       className='flex mt-4 gap-1 self-end text-[12px] text-zinc-500'
       >
        <span>
          Don't recived OTP ? 
        </span>
         { canResend ? (
         <span
          onClick={ResendOtp}
          className='text-blue-500 hover:text-blue-700 underline font-medium cursor-pointer'
          >
           Resend OTP
         </span>
        ):(
          <Loader
           size='10px'
           color='blue'
           />
        )}
      </div>
    </div>
  )
}

export default Otp;