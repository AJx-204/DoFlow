import React, { useState } from 'react'
import NavMenu from './NavMenu';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { VscAdd } from 'react-icons/vsc';
import Btn from '../Btn/Btn';
import useOrg from '../../Context/OrgContext';
import { Link, useLocation } from 'react-router-dom';
import { useTeam } from '../../Context/TeamContext';
import { GetRoleColor } from '../../utils/GetRoleColor';
import { HiOutlineUsers } from "react-icons/hi2";


const TeamsShow = () => {

    const location = useLocation();

    const { orgData } = useOrg();

    const { setSelectedTeam } = useTeam();

    const [isTeamsOpen, setIsTeamsOpen] = useState(false);

  return (
    <div
     className='ml-3 mt-1 flex flex-col text-[13px]'
     >
      <NavMenu
       onClick={()=>setIsTeamsOpen(!isTeamsOpen)}
       icon={<HiOutlineUsers size={18}  strokeWidth={1.5}/>}
       icon2={isTeamsOpen ? <IoIosArrowUp size={14} className='opacity-50 group-hover:opacity-100'/> : <IoIosArrowDown size={14} className='opacity-50 group-hover:opacity-100'/>}
       text={"Teams"}
       className={`${isTeamsOpen || location.pathname.includes('TeamMembers') ? "bg-zinc-500/15":""} hover:bg-zinc-300 dark:hover:bg-zinc-800 rounded-md cursor-pointer group`}
       />
    {isTeamsOpen && (
     <div className='ml-3'>
       {orgData?.teams?.length > 0 ? (
         <>
           {orgData.teams.map((team) => (
            <Link
             key={team._id}
             to={`/${orgData.orgName}/${team.teamName}/TeamMembers/${team._id}`}
             onClick={()=>setSelectedTeam(team)}
             >
             <div className={`${location.pathname.includes(team._id) ? "bg-zinc-800 text-zinc-300 shadow-md dark:bg-zinc-200 dark:text-zinc-800" :"hover:bg-zinc-300 dark:hover:bg-zinc-800 hover:border-zinc-500/10 bg-zinc-500/2 "} border border-zinc-500/10 rounded-md mt-1 flex justify-between items-center`}>
               <NavMenu
                key={team._id} 
                text={team.teamName} 
                className={'truncate whitespace-nowrap overflow-hidden'}
                />
                <div className="flex -space-x-2.5 pr-2 shrink-0">
                   {team.members?.slice(0, 5).map((mem) => (
                     <img
                       key={mem._id}
                       src={mem.member.profilePhoto || "/default-avatar.png"}
                       alt={mem.member.userName}
                       className={`w-6.5 h-6.5 shadow-md rounded-full border-2 ${GetRoleColor(mem.role)} object-cover`}
                     />
                   ))}
               </div>
             </div>
           </Link>
           ))}
           <div className='w-full flex justify-center'>
             <Btn
               text={"Create Team"}
               icon={<VscAdd strokeWidth={0.5} />}
               className='mt-2 flex shadow-md hover:bg-blue-500/60 hover:border-blue-500/70 gap-2 items-center px-3 py-1 rounded-md bg-blue-500/20 border border-blue-500/30'
             />
           </div>
         </>
       ) : (
         <div className='w-full flex justify-center'>
           <Btn
             text={"Create Team"}
             icon={<VscAdd strokeWidth={0.5} />}
             className='mt-2 flex shadow-md hover:bg-blue-500/60 hover:border-blue-500/70 gap-2 items-center px-3 py-1 rounded-md bg-blue-500/20 border border-blue-500/30'
           />
         </div>
       )}
      </div>
    )}
    </div>
  )
}

export default TeamsShow;