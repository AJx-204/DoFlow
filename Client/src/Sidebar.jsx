import React, { useEffect, useRef, useState } from 'react'
import { Btn, Logo, NavMenu, ProfileIcon, TeamsShow } from './Components'
import { PiSidebarSimpleLight } from 'react-icons/pi'
import { Link, useLocation } from 'react-router-dom';
import { GoProjectSymlink } from "react-icons/go";
import { IoIosArrowForward, } from "react-icons/io";
import { VscAdd } from "react-icons/vsc";
import useOrg from './Context/OrgContext';
import { useProject } from './Context/ProjectContext';
import { PiUsersFour } from "react-icons/pi";
import { CgProductHunt } from "react-icons/cg";
import { LuLayoutDashboard } from "react-icons/lu";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FaClipboardUser } from "react-icons/fa6";
import { GetRoleColor } from './utils/GetRoleColor';


const Sidebar = () => {

   const location = useLocation();

   const { orgData } = useOrg();

   const { setSelectedProject } = useProject();

   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   const sidebarRef = useRef(null);

   useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        window.innerWidth < 800
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 800) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true)
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
   
   
  return (
    <>
      {isSidebarOpen ? (
       <div
       ref={sidebarRef}
        className='sideBar flex flex-col justify-between gap-10 sticky top-0 left-0 
         h-screen w-60 shrink-0 border-r-2 border-zinc-500/10
        bg-zinc-100 dark:bg-zinc-900 z-100 text-zinc-700 dark:text-zinc-300 
        tracking-tight font-semibold dark:font-medium overflow-y-auto'
        >
           <div className='flex flex-col'>
              <div
               className='w-full sticky top-0 flex justify-between p-3 border-b-2 border-zinc-500/10 bg-zinc-100 dark:bg-zinc-900'
               >
                <Link
                to={"/"}
                 >
                <Logo style={"text-zinc-800 dark:text-zinc-200"}/>
                </Link>
                <i 
                 onClick={()=>setIsSidebarOpen(false)}
                 className='p-0.5 rounded bg-zinc-500/10 hover:bg-zinc-500/30'
                 >
                  <PiSidebarSimpleLight size={20}/>
                </i>
              </div>
              <div className='p-2'>
                <div
                 className='flex items-center group justify-between hover:bg-zinc-500/10 rounded-md pr-2 text-[12px] cursor-pointer text-zinc-600/90 dark:text-zinc-400/90 font-semibold tracking-wider'
                 >
                  <NavMenu
                   text={"Workforce"}
                   />
                   <i
                   className='opacity-50 group-hover:opacity-100'
                    >
                     <VscAdd size={12} strokeWidth={0.5}/>
                   </i>
                </div>
                <Link
                 to={`/${orgData?.orgName}/members`}
                 className='ml-3 flex flex-col text-[13px] mt-1'
                 >
                   <NavMenu
                    icon={< PiUsersFour size={18}/>}
                    text={"Members"}
                    icon2={<IoIosArrowForward size={14} className='opacity-50 group-hover:opacity-100'/>}
                    className={`${location.pathname.includes("members") ? "bg-zinc-800 text-zinc-300 shadow-md dark:bg-zinc-200 dark:text-zinc-800" :"group hover:bg-zinc-300 dark:hover:bg-zinc-800"} rounded-md cursor-pointer `}
                    />
                </Link>
                <TeamsShow/>
              </div>
              <div
               className='px-2 mt-2 flex flex-col gap-1 text-[13px] pt-2 border-t-2 border-zinc-500/8'
               > 
                 <div
                  className='text-[12px] font-semibold tracking-wider text-zinc-600/90 dark:text-zinc-400/90 flex items-center group justify-between hover:bg-zinc-500/10 rounded-md pr-2 cursor-pointer'
                  >
                   <NavMenu
                    
                    text={"Projects"}
                    />
                    <i
                    className='opacity-50 group-hover:opacity-100'
                     >
                      <VscAdd size={12} strokeWidth={0.5}/>
                    </i>
                 </div>
                 {orgData?.projects?.length > 0 ? orgData.projects.map((pro)=>(
                 <Link
                  to={`/${orgData?.orgName}/${pro?.projectName}/${pro._id}`}
                  key={pro._id} 
                  onClick={()=>setSelectedProject(pro)}
                  className={`${location.pathname.includes(pro._id) ? "bg-zinc-800 text-zinc-300 shadow-md dark:bg-zinc-200 dark:text-zinc-800" :"group hover:bg-zinc-300 dark:hover:bg-zinc-800"} flex items-center justify-between ml-3 rounded-md`}
                  >
                   <NavMenu
                    icon={<GoProjectSymlink size={16}/>}
                    text={pro?.projectName}
                    className={'truncate whitespace-nowrap overflow-hidden'}
                    />
                    <div className="flex -space-x-2.5 pr-2 shrink-0">
                        <img
                          src={pro.createdBy.profilePhoto || "/default-avatar.png"}
                          alt={pro.createdBy.userName}
                          className="w-6.5 h-6.5 shadow-md rounded-full border-2 object-cover"
                        />
                    </div>
                 </Link>
                 )):(
                  <div className='w-full flex justify-center'>
                    <Btn
                     text={"Create Project"}
                     icon={<VscAdd strokeWidth={0.5}/>}
                     className={'mt-2 flex shadow-md hover:bg-blue-500/60 hover:border-blue-500/70 gap-2 items-center px-3 py-1 rounded-md bg-blue-500/20 border border-blue-500/30'}
                     />
                  </div>
                 )}
              </div>
            </div>
          <div className='flex flex-col text-[13px]'>
             <Link
              to={`/${orgData?.orgName}/dashboard`} 
              className='p-2 border-t-2 border-zinc-500/10'>
               <NavMenu
                icon={<LuLayoutDashboard size={18}/>}
                text={"Dashboard"}
                icon2={<HiOutlineDotsVertical size={16} className={`${location.pathname.includes('dashboard')? "opacity-100" : "group-hover:opacity-100"} opacity-50 `}/>}
                className={`${location.pathname.includes('dashboard') ? "bg-zinc-800 text-zinc-300 shadow-md dark:bg-zinc-200 dark:text-zinc-800" : "hover:bg-zinc-300 dark:hover:bg-zinc-800"} group rounded-md`}
               />
             </Link>
             <ProfileIcon/>
          </div>
       </div>
      ):(
        <i 
          onClick={()=>setIsSidebarOpen(true)}
          className='fixed top-2.5 left-2.5 p-0.5 rounded bg-zinc-500/10 hover:bg-zinc-500/30 z-100'
          >
           <PiSidebarSimpleLight size={20}/>
        </i>
      )}
      
    </>
  )
}

export default Sidebar