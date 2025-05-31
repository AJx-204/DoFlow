import React, { useEffect, useRef, useState } from 'react'
import { IoIosArrowDown } from "react-icons/io";
import useUser from '../../Context/UserContext';
import useOrg from '../../Context/OrgContext';
import {Btn, Loader} from '../index';
import { MdAdd } from "react-icons/md";
import { Link, useLocation, useNavigate } from 'react-router-dom';


const SelectOrg = () => {

  const navigate = useNavigate();

  const location = useLocation();

  const { user } = useUser();
  
  const { orgData, changeOrg, orgLoading, orgError, setOrgError } = useOrg();

  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const orgListRef = useRef();

  const isOrgPage = location.pathname.split('/').pop() == orgData?._id

  useEffect(()=>{
    const handleClickOutside = (e) => {
      if(orgListRef.current && !orgListRef.current.contains(e.target)){
        setShowOrgMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  },[])

  useEffect(() => {
    if (!orgLoading && orgData) {
      setShowOrgMenu(false);
      navigate(`/${orgData?.orgName}/${orgData?._id}`)
    };
    }, [orgLoading, orgData]);
  
  const handleSelectOrg = (id) => {
     if (orgData && orgData._id == id){
       setShowOrgMenu(false);
       return
     }  
     changeOrg(id)
  }


  return ( user ? 
           <div>
              {orgData || user.inOrg.length > 0 ? (
             <div
              onClick={()=>(setOrgError('') ,setShowOrgMenu(true))}
              className={`${showOrgMenu ? "border-zinc-500 shadow-md" : "hover:border-zinc-500 hover:shadow-md border-zinc-500/30"}
              ${isOrgPage ? "bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800" : ""}
               cursor-pointer max-w-50 group shadow p-1 pr-2 flex gap-2 border  items-center rounded-full text-sm font-semibold`}
              >
               <div
                className='h-6 w-6 rounded-full flex items-center justify-center overflow-hidden border border-zinc-500/50 '
                >
                 <img className='h-full w-full object-cover' src={orgData?.orgProfilePhoto || "/default-org.png"} alt="" />
               </div>
               {orgLoading ? <Loader size='15px' color='blue'/> :
                <span className='line-clamp-1'>{orgData?.orgName || "Select Org"}</span>
               }
               <IoIosArrowDown className='group-hover:mt-1.5 text-zinc-500'/>
             </div>
           ):(
             <Btn
              text={'Create Organization'}
              className={'font-medium text-[12px] px-2 py-[5.5px] rounded-full shadow-md bg-blue-500/30 border border-blue-500/50 hover:bg-blue-500/50 hover:border-blue-500'}
              />
           )}
           {showOrgMenu && <div
            ref={orgListRef}
            className='w-[300px] absolute text-sm right-2 top-11 p-2 rounded-md border border-zinc-500/30 shadow-md bg-white dark:bg-zinc-900 '
            >
             <div
              className='p-2 text-zinc-500 font-semibold text-[12px]'
              >
               <span>Select Organization</span>
             </div>
             {orgLoading ? (
               <Loader
                size='16px'
                color='blue'
                />
              ):(user?.inOrg?.map(item => (
               <Link
                 to={`/${orgData?.orgName}/${orgData?._id}`}
                 key={item.org._id}
                 className='p-2 flex gap-3 rounded-md hover:bg-zinc-500/20 items-center'
                 onClick={() => handleSelectOrg(item?.org._id)}
                >
                 <div
                  className='h-8 w-8 rounded-full border border-zinc-500/50 flex items-center justify-center overflow-hidden'
                  >
                  <img className='w-full h-full object-cover' src={item.org?.orgProfilePhoto || "/default-org.png"} alt="" /> 
                 </div>
                 <span className='line-clamp-1 font-medium'>{item.org.orgName}</span>
               </Link>
             )))}
             <div className='flex justify-center m-1 mt-2'>
               <Btn
                text={'Create Organization'}
                className={'flex items-center gap-2 text-xs font-semibold p-1.5 pr-3 border border-blue-500/30 bg-blue-500/20 rounded-md hover:bg-blue-500/50 hover:border-blue-500/70 shadow-md'}
                icon={<MdAdd size={16}/>}
               />
             </div>
             {orgError && <span className='text-red-500'>{orgError}</span>}
           </div>}
           </div>
      : ""
  )
}

export default SelectOrg