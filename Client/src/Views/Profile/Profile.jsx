import React, { useEffect, useRef, useState } from 'react'
import useUser from '../../Context/UserContext'
import useTheme from '../../Context/ThemeContext';
import { Link } from 'react-router-dom';
import { AiOutlineLogout, AiOutlineSun } from "react-icons/ai";
import { Btn, Menu } from '../../Components';
import { PiMoon } from "react-icons/pi";
import { IoSettingsOutline} from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import { Conform } from '../';
import { CiUser } from 'react-icons/ci';


const Profile = ({setShowProfile}) => {

   const { user, logout } = useUser();
   const { Theme, lightTheme, darkTheme } = useTheme();

   const [showThemeButton, setShowThemeButton] = useState(false);
   const [showConformPopup, setShowConformPopup] = useState(false);
   const profileRef = useRef(null);

   useEffect(() => {
     if (showConformPopup) return;
     const handleClickOutside = (event) => {
       if (profileRef.current && !profileRef.current.contains(event.target)) {
         setShowProfile(false);
       }
     };
 
     document.addEventListener("mousedown", handleClickOutside);
     return () => {
       document.removeEventListener("mousedown", handleClickOutside);
     };
   }, [showConformPopup, profileRef, setShowProfile]);

  return (
   <>
    <div
     ref={profileRef}
     className='z-90 text-[14px] text-zinc-500 font-medium flex flex-col gap-1 rounded-md fixed bottom-18 left-20 shadow-md border border-zinc-200 bg-zinc-100 dark:border-zinc-700/50 dark:bg-zinc-800'
     >
      <div
       className='p-1 border-b border-zinc-500/20' 
       >
        <div
         className='flex gap-2.5 items-center p-1.5'>
           <div className='flex items-center justify-center overflow-hidden w-10 h-10 bg-slate-200 dark:bg-zinc-950 rounded-full'>
              {user.profilePhoto ? <img className='h-full w-full object-cover' src={user.profilePhoto} alt="" /> : <CiUser size={24}/>}
           </div>
           <div className='flex flex-col mt-0.5 text-[12px]'>
              <p className='font-semibold text-[13px]'>{user.userName}</p>
              <span className='text-zinc-500'>
                {user.email}
              </span>     
           </div>
        </div>   
      </div>
      <div
        className='p-2 flex flex-col gap-1' 
       >
        <Link
         to={`/profile/${user.userName}`}
         >
          <Menu
            icon={<IoSettingsOutline size={20}/>}
            text={"Profile Setting"}
            onClick={()=>setShowProfile(false)}
           />
        </Link>
        <Menu
         icon={Theme == 'light' ? <AiOutlineSun size={20}/> : <PiMoon size={20}/>}
         text={"Theme"}
         secondIcon={<IoIosArrowForward size={18}/>}
         onClick={()=>setShowThemeButton(!showThemeButton)}
        />
      </div>
      <div
        className='p-2 border-t border-zinc-500/20' 
       >
        <Menu
         onClick={()=>setShowConformPopup(true)}
         icon={<AiOutlineLogout size={20} className='-rotate-90'/>}
         text={"Log Out"}
         style={"hover:text-red-500"}
         />
      </div>
      {showThemeButton &&
        <div
         className='absolute flex gap-3 bottom-14 -right-32 text-[12px] font-semibold p-3 rounded border shadow-md
          border-zinc-300 dark:border-zinc-700/70 dark:bg-zinc-800 bg-zinc-100'
         >
           <div
            className='flex flex-col gap-1 items-center'
            >
             <Btn
              onClick={lightTheme}
              className={'bg-white border border-black h-10 w-10 rounded'}
              />
             <span>Light</span>
           </div>
           <div
            className='flex flex-col gap-1 items-center'
            >
             <Btn
              onClick={darkTheme}
              className={'bg-black border border-white h-10 w-10 rounded'}
              />
             <span>Dark</span>
           </div>
        </div>
       }
    </div>
    {showConformPopup && 
      <Conform 
       title={'Conform Log-Out'}
       p1={'You are about to log out of your account. If you continue, you will need to sign-In again to access your DoFlow account.'}
       p2={'Are you sure you want to proceed with logging out?'}
       cancelText={'Cancel'}
       conformText={'Conform'}
       onCancel={()=>setShowConformPopup(false)}
       onConform={logout}
       danger={true}
       />
    }
   </>
  )
}

export default Profile