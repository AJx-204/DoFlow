import React, { useState } from 'react'
import useUser from '../../Context/UserContext';
import { Profile } from '../../Views';
import { CiUser } from "react-icons/ci";
import { useLocation } from 'react-router-dom';

const ProfileIcon = () => {

    const location = useLocation();

    const { user, logout } = useUser();
    const [showProfile, setShowProfile] = useState(false);

    function sliceEmail(Email){
       if(!Email) return ;
       return Email.length > 20 ? Email.slice(0,20) + "....." : Email;
    };

  return (
    <>
      <div className='p-1 border-t-2 border-zinc-500/10 cursor-pointer'>
       {user && 
         <div
          onClick={()=>setShowProfile(!showProfile)} 
          className={`${location.pathname.includes('profile') ? "bg-zinc-800 text-zinc-300 shadow-md dark:bg-zinc-200 dark:text-zinc-800" : "hover:bg-zinc-300 dark:hover:bg-zinc-800"} p-2 rounded-md  flex gap-6 justify-between items-center`}>
           <div className='flex gap-2.5 items-center'>
               <div className='flex items-center justify-center overflow-hidden w-9 h-9 bg-slate-200 dark:bg-zinc-950 rounded'>
                 {user.profilePhoto ? <img className='h-full w-full object-cover' src={user.profilePhoto} alt="" /> : <CiUser size={22}/>}
               </div>
               <div className='flex flex-col mt-0.5 text-[12px]'>
                  <p className='text-[13px]'>{user.userName}</p>
                  <span className='text-zinc-500'>
                    {sliceEmail(user.email)}
                  </span>
               </div>
           </div>
          </div>
        }   
      </div>  
      {showProfile && (
        <Profile setShowProfile={setShowProfile}/>
      )}
    </>
  )
};

export default ProfileIcon;