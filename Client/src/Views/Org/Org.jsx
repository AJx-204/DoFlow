import React, { useState } from 'react'
import useOrg from '../../Context/OrgContext';
import { FiEdit } from 'react-icons/fi';
import { CiUser } from 'react-icons/ci';
import { GetRoleColor } from '../../utils/GetRoleColor';
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { GoProjectSymlink } from "react-icons/go";
import { BsMicrosoftTeams } from "react-icons/bs";
import { CgDanger } from 'react-icons/cg';
import { TbLogout2 } from 'react-icons/tb';
import { Btn, UpdateOrg } from '../../Components';
import { Conform } from '../';

const Org = () => {

  const { orgData, orgLoading, orgError, setOrgError, leaveOrg } = useOrg();

  const [showUpdateOrgPopup, setShowUpdateOrgPopup] = useState(false);
  const [showConformPopup, setShowConformPopup ] = useState(false);

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLeveOrg = async () => {
     const success = await leaveOrg();
     if(success){
      setShowConformPopup(false)
     }
  }

  return ( orgData ?
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
              {orgData.orgProfilePhoto ? <img className='h-full w-full object-cover rounded-full' src={orgData.orgProfilePhoto} alt="" /> : <CiUser size={30}/>}
            </div>
            <i onClick={()=>setShowUpdateOrgPopup(true)}
             className='self-end p-1 mb-1 bg-zinc-500/10 rounded hover:text-blue-500 text-zinc-500 hover:border-blue-500/40 border border-zinc-500/15'>
               <FiEdit/>
            </i>
          </div>
          <div className='flex flex-col'>
           <span className='text-sm font-medium'>Organization</span>
           <span className='text-zinc-500 tracking-wide'>{orgData.orgName}</span>
         </div>           
         <div className='flex flex-col max-w-110'>
           <span className='text-sm font-medium'>Description</span>
           <span className='text-zinc-500 tracking-wide'>{orgData.description ? orgData.description : "No description !"}</span>
           <span className="mt-3 text-[10px] text-zinc-500 italic font-medium">
             Created-At • {formatDate(orgData.createdAt)}
           </span>
         </div>
       </div>
       <div
         className='flex flex-col gap-2 items-start'
         >
           <span
            className='flex items-center gap-2 text-lg'
            >
            <AiOutlineUsergroupAdd size={24} className='text-amber-500 cursor-pointer hover:text-amber-700'/>
             WorkForce
           </span>
           <div className='flex -space-x-2 flex-wrap max-w-100'>
              {orgData.members.length > 0 ? orgData.members?.map((mem) => (
                <div
                 key={mem._id}
                 className='group'>
                  <img
                    src={mem.member.profilePhoto || "/default-avatar.png"}
                    alt={mem.member.userName}
                    className={`cursor-pointer w-10 h-10 shadow-md rounded-full border-2 ${GetRoleColor(mem.role)} object-cover`}
                  />
                  <div className='hidden px-3 py-1 text-xs rounded-md bg-zinc-100 dark:bg-zinc-900 border-zinc-500/50 border absolute group-hover:flex'>
                     <span>{mem.member.userName}</span>
                  </div>
                </div>
              )):(<span className='text-zinc-500 text-sm ml-4'>No Members !</span>)}  
            </div>                                     
        </div>
        <div
         className='flex flex-col gap-2 items-start'
         >
           <span
            className='flex items-center gap-2 text-lg mb-2'
            >
              <GoProjectSymlink size={20} className='text-purple-500'/>
             Projects
           </span>
           {orgData.projects.length > 0 ? orgData.projects.map((pro)=>(
           <div key={pro._id} className='flex items-center gap-2 ml-4 text-zinc-500'>
              <img className='size-6.5 rounded-full' src={pro.createdBy.profilePhoto} alt="" />
               <span>{pro.projectName}</span>
           </div>
           )):(<span className='text-zinc-500 text-sm ml-4'>No Projects !</span>)}
        </div>
         <div
         className='flex flex-col gap-2 items-start'
         >
           <span
            className='flex items-center gap-2 text-lg mb-2'
            >
            <BsMicrosoftTeams size={20} className='text-sky-500'/>
             Teams
           </span>
           {orgData.teams.length > 0 ? orgData.teams.map((pro)=>(
           <div key={pro._id} className='flex items-center gap-2 ml-4 text-zinc-500'>
               <i className='h-6 w-6 flex items-center justify-center text-sm text-white rounded-full bg-zinc-500'>{pro.teamName?.charAt(0).toUpperCase()}</i>
               <span>{pro.teamName}</span>
           </div>
           )):(<span className='text-zinc-500 text-sm ml-4'>No Teams !</span>)}
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
            Leave Organization
           </span>
           <p
            className='max-w-100 text-zinc-500'
            >
               Leaving this organization will revoke your access to all it's teams, projects, and associated data. You will no longer be able to collaborate with it's members unless re-invited. Are you sure you want to proceed ?
           </p>
          <Btn
           onClick={()=>setShowConformPopup(true)}
           text={"Leave"}
           icon={<TbLogout2 size={18}/>}
           className={"cursor-pointer w-[max-content] text-[14px] flex items-center gap-3 mt-2 text-red-500 hover:text-red-600 hover:scale-102"}
           />
        </div>
        { showUpdateOrgPopup && <UpdateOrg setShowUpdateOrgPopup={setShowUpdateOrgPopup}/>}
        { showConformPopup && 
          <Conform 
           title={'Leave Organization'}
           p1={" Leaving this organization will revoke your access to all it's teams, projects, and associated data. You will no longer be able to collaborate with it's members unless re-invited. Are you sure you want to proceed ?"}
           cancelText={"Cancle"}
           conformText={'Leave'}
           error={orgError}
           loding={orgLoading}
           danger={true}
           onCancel={()=>(setShowConformPopup(false), setOrgError(''))}
           onConform={handleLeveOrg}
          />}
     </div>
     :
     <div className='p-4 font-medium text-zinc-500'>No Organization !</div>
  )
}

export default Org;