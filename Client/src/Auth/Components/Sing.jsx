import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Btn, Logo, Input, Loader } from '../../Components/index.js';
import { BiImageAdd } from 'react-icons/bi'
import useUser from '../../Context/UserContext.jsx';
import useOrg from '../../Context/OrgContext.jsx';


const Sing = () => {

  const navigate = useNavigate();

  const { orgData } = useOrg();

  const {
    user,
    singUp,
    login,
    authError,
    setAuthError,
    authLoding,
    resendOtp,
  } = useUser();

  const [ isSingUp, setIsSingUp ] = useState(true);
  const [ userName, setUserName ] = useState('');
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ profilePhoto, setProfilePhoto ] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    };
  };

  const handleSingUpChange = () => {
    setAuthError('')
    isSingUp ? setIsSingUp(false) : setIsSingUp(true)
  };

  const authSubmit = async (e) =>{
    e.preventDefault();
    setAuthError('')
    if(isSingUp){
      const success = await singUp(userName, profilePhoto, email, password);
      if (success) {
        navigate('/verify-otp');
      }
    }else{
      const result = await login(email, password);
      if(result.success){
        if(orgData){
          navigate(`/${orgData?.orgName}/${orgData._id}`)
        }else{
          navigate(`/profile/${user?.userName}`)
        }
      }else if(result.redirectToVerify){
        await resendOtp(email)
        navigate('/verify-otp')
      }
    }
  };

  const handleForgotPassword = () => {
    navigate('/reset-password')
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
           {isSingUp ? "Create Account" : "Welcome Back !"}
         </span>
         <span
          className='text-[15px] text-zinc-500'
          >
           {isSingUp ? "create your new Account" : "Login with Email and Password"}
         </span>
       </div>
       <form
        onSubmit={authSubmit}
        className='flex flex-col w-full items-start gap-4 text-sm'
        >
          {isSingUp && (
            <>
            <Input
              className={"flex flex-col w-full gap-0.5"}
              htmlFor={'userName'}
              labelClassName={'ml-0.5 text-[12px] font-medium'}
              label={"UserName"}
              type={'text'}
              id={'userName'}
              placeholder={"User Name here . . . ."}
              onChange={(e)=>setUserName(e.target.value)}
              inputClassName={'bg-zinc-100 dark:bg-zinc-900 focus:border-blue-500/30 focus:bg-blue-500/10 outline-0 placeholder:text-zinc-500 placeholder:font-light font-medium p-2 rounded border border-zinc-300 dark:border-zinc-800'}
              required={true}
             />
             <Input
              className={"flex flex-col w-full gap-0.5"}
              htmlFor={'profileUpload'}
              labelClassName={'ml-0.5 text-[12px] font-medium'}
              label={"Uplode profile picture !"}
              type={'file'}
              accept={'image/*'}
              id={'profileUpload'}
              onChange={handleFileChange}
              inputClassName={"hidden"}
              SecondLabelClassName={"h-22 w-22 overflow-hidden cursor-pointer group bg-zinc-100 dark:bg-zinc-900 hover:bg-blue-500/10 hover:border-blue-500/30 text-center flex items-center justify-center rounded border border-zinc-300 dark:border-zinc-800 text-zinc-500 text-sm font-medium"}
              SecondLabel={previewUrl ? 
                   <img
                     src={previewUrl}
                     alt="Uploaded"
                     className="object-cover w-full h-full rounded"
                   />
                   : 
                   <BiImageAdd className='size-8 group-hover:scale-105 group-hover:text-blue-500'/>
                 }
              />
             {profilePhoto && previewUrl &&
              <Btn
               onClick={()=>(setPreviewUrl(null), setProfilePhoto(null))}
               type={'button'}
               text={'Cancle'}
               className={"w-[max-content] px-5.5 py-1 rounded text-red-500 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 hover:bg-red-500/10 hover:border-red-500/30"}
               /> 
              }
            </>
          )}
          <Input
            className={"flex flex-col w-full gap-0.5"}
            htmlFor={'email'}
            label={"Email"}
            labelClassName={"ml-0.5 text-[12px] font-medium"}
            type={"email"}
            id={'email'}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder={"Enter Email here . . . ."}
            inputClassName={'bg-zinc-100 dark:bg-zinc-900 focus:border-blue-500/30 focus:bg-blue-500/10 outline-0 placeholder:text-zinc-500 placeholder:font-light font-medium p-2 rounded border border-zinc-300 dark:border-zinc-800'}
            required={true}
           />
          <Input
            className={"flex flex-col w-full gap-0.5"}
            htmlFor={'password'}
            label={"Password"}
            labelClassName={"ml-0.5 text-[12px] font-medium"}
            type={"password"}
            id={'password'}
            onChange={(e)=>setPassword(e.target.value)}
            placeholder={"Password here . . . ."}
            inputClassName={'bg-zinc-100 dark:bg-zinc-900 focus:border-blue-500/30 focus:bg-blue-500/10 outline-0 placeholder:text-zinc-500 placeholder:font-light font-medium p-2 rounded border border-zinc-300 dark:border-zinc-800'}
            required={true}
           />
          {isSingUp ? null : (
            <span
             onClick={handleForgotPassword}
             className='ml-0.5 font-medium text-blue-500 hover:text-blue-700 hover:underline text-[12px]'
             >
              Forgot Password
            </span>
          )}
          { authError && <span
           className='ml-0.5 text-sm text-red-500'
           >
            {authError}
          </span>}
          <div 
           className='flex mt-4 w-full justify-center'
           >
            {authLoding ? (
               <Loader
                size='15px'
                color='blue'
                />
            ):(isSingUp ? (
               <Btn
                text={"Sing Up"}
                className={"px-4 py-1 bg-blue-500 text-white rounded shadow-md hover:bg-blue-700 cursor-pointer"}
                />
              ):(
               <Btn
                text={"Login"}
                className={"px-4 py-1 bg-blue-500 text-white rounded shadow-md hover:bg-blue-700 cursor-pointer"}
                />
              )
            )}
          </div>
          <div 
           className='flex mt-4 self-end text-[12px] text-zinc-500'
           >
            <div
             className='flex gap-1'
             >
              <span>
                {isSingUp ?  " Already have account ? " : " Create New account ! "}
              </span>
              <span
               onClick={handleSingUpChange}
               className='text-blue-500 hover:text-blue-700 font-medium underline cursor-pointer'
               >
                { isSingUp ? "Login" : "Sing Up"}
              </span>
            </div>
          </div>
       </form>
    </div>
  )
}

export default Sing;