import React, { useState} from 'react'
import useUser from '../../Context/UserContext';
import { Btn } from '../../Components';
import { TbBuildingSkyscraper, TbLogout2 } from "react-icons/tb";
import { CgDanger } from "react-icons/cg";
import useTheme from '../../Context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { RiResetLeftLine} from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { IoIosLock } from "react-icons/io";
import { CiUser } from 'react-icons/ci';
import { UpdateUser } from '../../Auth';
import { RiOrganizationChart } from "react-icons/ri";
import { GetRoleColor } from '../../utils/GetRoleColor';
import { BiTask } from "react-icons/bi";


const ProfilePage = () => {

   const navigate = useNavigate(); 

   const { user, logout, setAuthError } = useUser();
   const { lightTheme, darkTheme } = useTheme(); 

   const [showUpdateUserPopup, setShowUpdateUserPopup] = useState(false);

   const handleResetPassword = () => {
      navigate('/reset-password')
   } 

  return ( user &&
    <div
     className='flex flex-col w-full p-8 gap-12 min-h-screen'
     >
      <div
       className='flex flex-col gap-4'
       >
         <div
          className='flex gap-10'
          >
           <div className='flex items-center justify-center overflow-hidden w-20 h-20 bg-slate-200 dark:bg-zinc-950 rounded-full -ml-1'>
             {user.profilePhoto ? <img className='h-full w-full object-cover' src={user.profilePhoto} alt="" /> : <CiUser size={30}/>}
           </div>
           <i
            onClick={()=>(setAuthError(""), setShowUpdateUserPopup(true))} 
            className='self-end p-1 mb-1 bg-zinc-500/10 rounded hover:text-blue-500 text-zinc-500 hover:border-blue-500/40 border border-zinc-500/15'>
              <FiEdit/>
           </i>
         </div>
         <div className='flex flex-col'>
           <span className='text-sm font-medium'>UserName</span>
           <span className='text-zinc-500 tracking-wide'>{user.userName}</span>
         </div>
         <div className='flex flex-col'>
           <span className='text-sm font-medium'>Email</span>
           <span className='text-zinc-500 tracking-wide'>{user.email}</span>
         </div>
      </div>
      <div
       className='flex flex-col gap-2'
       >
         <span className='mb-2 flex gap-2 items-center text-lg'>
           < BiTask size={22} className='text-emerald-500'/>
           Assing Tasks
         </span>
         <span className='text-zinc-500/80 text-sm ml-4'>No Tasks For You !</span>
      </div>
      <div
       className='flex flex-col gap-2'
       >
         <span className='mb-2 flex gap-2 items-center text-lg'>
           <RiOrganizationChart size={22} className='text-amber-500'/>
           In Organizations
         </span>
         {user.inOrg.length > 0 ?  user.inOrg.map((org)=>(
         <div
          key={org.org._id}
          className='ml-2 flex items-center gap-2 text-zinc-600 dark:text-zinc-400 p-1'
          > 
            <TbBuildingSkyscraper size={16} className='text-yellow-500'/>
            <span>{org.org.orgName}</span>
            <span className={`${GetRoleColor(org.role)} px-1 border rounded text-[9px] ml-2 font-medium`}>
                {org.role}
             </span>
         </div>
         )):(
          <span className='text-zinc-500/80 text-sm ml-4'>No Organizations !</span>
         )}
      </div>
      <div
         className='flex flex-col gap-2'
         >
         <span className='text-lg'>Theme Switch</span>
         <div
          className='flex gap-2'
          >
           <div
            className='flex flex-col items-center'
            >
              <Btn
               onClick={lightTheme}
               className={'h-16 w-16 bg-white rounded border border-black'}
               />
               <span className='text-zinc-500'>Light</span>
           </div>
           <div
            className='flex flex-col items-center'
            >
              <Btn
               onClick={darkTheme}
               className={'h-16 w-16 bg-black rounded border border-white'}
               />
               <span className='text-zinc-500'>Dark</span>
           </div>
          </div>
        </div>
        <div
         className='flex flex-col gap-2 items-start'
         >
           <span
            className='flex items-center gap-2 text-lg'
            >
             <IoIosLock size={22} className='text-blue-600 mb-0.5'/>
             Forgot Password
           </span>
           <p className='max-w-100 text-zinc-500'>
             If you forgot your password, don't worry. You can reset it securely using an OTP sent to your registered email. Click the button below to start the reset process.
           </p>
           <Btn
           onClick={handleResetPassword}
           icon={<RiResetLeftLine size={17}/>}
           text={"Reset Password"}
           className={"cursor-pointer text-sm flex items-center gap-1.5 hover:scale-102 mt-2 text-blue-500"}
           />
        </div>
        <div
         className='flex flex-col gap-2'
         >
          <span
           className='text-lg flex items-center gap-2'
           >
            <i>
              <CgDanger size={22} className='text-red-500 mt-0.5'/>
            </i>
            Log out from this Account
           </span>
           <p
            className='max-w-100 text-zinc-500'
            >
             You are about to log out of your account. If you continue, you'll need to sign-In again to access your DoFlow account.
           </p>
          <Btn
           onClick={logout}
           text={"Log-Out"}
           icon={<TbLogout2 size={18}/>}
           className={"cursor-pointer w-[max-content] text-[14px] font-medium items-center flex gap-3 mt-2 text-red-500 hover:text-red-600 hover:scale-102"}
           />
        </div>
        { showUpdateUserPopup && <UpdateUser setShowUpdateUserPopup={setShowUpdateUserPopup}/>}
    </div>
  )
}

export default ProfilePage;