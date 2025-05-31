import React, { useState } from 'react'
import { useProject } from '../../Context/ProjectContext';
import { GoProjectSymlink } from "react-icons/go";
import { Btn, NavMenu } from '../../Components'
import { MdAdd } from 'react-icons/md';
import { GetRoleColor } from '../../utils/GetRoleColor';
import { Link } from 'react-router-dom';
import { VscAdd } from 'react-icons/vsc';


const Projects = () => {

  const { selectedProject } = useProject();

  const [selectedSection, setSelectedSection] = useState('');


  return (
    selectedProject ? <div>
        <div className='flex items-center justify-between gap-2 p-3'>
            <div className='flex flex-col gap-1 font-medium dark:font-normal w-full'>
                <h2 className='flex items-center gap-2 text-lg'><GoProjectSymlink size={20}/>{selectedProject.projectName}</h2>
                <p className='description max-w-200 line-clamp-1 text-[12px] text-zinc-500'>{selectedProject.description}</p>
            </div>
            <div className='flex justify-end gap-1 flex-wrap w-full'>
               <div className="flex -space-x-2.5 pr-2 shrink-0">
                    {selectedProject.members?.slice(0, 5).map((mem) => (
                      <img
                        key={mem._id}
                        src={mem.member.profilePhoto || "/default-avatar.png"}
                        alt={mem.member.userName}
                        className={`w-7 h-7 shadow-md rounded-full border-2 ${GetRoleColor(mem.role)} object-cover`}
                      />
                    ))}
                    {selectedProject.members?.length > 5 && (
                      <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 font-medium flex items-center justify-center border-2 border-white dark:border-black shadow-md">
                        +{selectedProject.members.length - 5}
                      </div>
                    )}
                </div>
               <Btn 
                icon={<MdAdd size={16}/>} 
                text={'Invite'}
                className={'flex gap-1 items-center text-xs font-semibold p-1 pr-2 rounded-md bg-blue-500/20 border border-blue-500/30 shadow-md hover:bg-blue-500/60 hover:border-blue-500/70'}
                />
            </div>
        </div>
        <div className='pr-2 pl-2 border-b-2 border-zinc-500/10 flex gap-5 overflow-auto scrollbar-hidden'>
          {selectedProject.projectSections.length > 0 ? selectedProject.projectSections.map((sec)=>(
           <Link
            key={sec._id}
            onClick={()=>setSelectedSection(sec)}
            to={`/${selectedProject.inOrg.orgName}/${selectedProject.projectName}/${selectedProject._id}/${sec.sectionName}/${sec._id}`} 
            >
              <NavMenu
                text={sec.sectionName}
                className={`${location.pathname.includes(sec._id) ? "text-blue-500 border-b-2" : "text-zinc-500"} font-medium text-sm no-transition`}
               />
           </Link>
          )) : 
          <Btn
           text={'Add Section'}
           icon={<VscAdd/>}
           className={"flex font-medium gap-2 items-center text-xs px-3 pr-4 py-1.5 border border-blue-500/30 bg-blue-500/20 hover:border-blue-500/70 hover:bg-blue-500/50 rounded text-zinc-800 dark:text-zinc-300 mb-2 shadow-md"}
          />}
        </div>
    </div> : <p className='p-4'>Not Project Found !</p>
  )
}

export default Projects;