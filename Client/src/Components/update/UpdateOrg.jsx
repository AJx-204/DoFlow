import React, { useEffect, useRef, useState } from 'react'
import { GoArrowLeft } from 'react-icons/go';
import { Logo, Input, Btn, Loader }  from '../index';
import { BiImageAdd } from 'react-icons/bi';
import useOrg from '../../Context/OrgContext';

const UpdateOrg = ({setShowUpdateOrgPopup}) => {

    const { updateOrg, orgLoading, orgError, setOrgError } = useOrg();

    const updatePopupRef = useRef();
    const [ orgName, setOrgName ] = useState('');
    const [ description, setDescription ] = useState('');
    const [ profilePhoto, setProfilePhoto ] = useState(null);
    const [ previewUrl, setPreviewUrl ] = useState(null);

    useEffect(()=>{
      const handleClickOutside = (e) => {
        if(updatePopupRef.current && !updatePopupRef.current.contains(e.target)){
          setShowUpdateOrgPopup(false);
          setOrgError('')
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    },[]);
    
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      setProfilePhoto(file);
      if (file) {
        setPreviewUrl(URL.createObjectURL(file));
      };
    };

    const handleUpdateOrg = async (e) => {
        e.preventDefault();
        const success = await updateOrg(orgName, description, profilePhoto);
        if(success){
            setOrgError('')
            setShowUpdateOrgPopup(false)
        }
    };

  return (
    <div
     className='fixed top-0 left-0 w-screen h-screen bg-black/80 flex items-center justify-center z-100 shadow-md'
     >
        <div
        ref={updatePopupRef} 
        className='flex flex-col gap-1'>
         <div
         onClick={()=>(setShowUpdateOrgPopup(false),setOrgError(''))}
           className='text-white flex gap-2 items-center hover:gap-0 hover:-ml-2 p-2 font-medium w-[max-content]'
           >
             <GoArrowLeft size={18}/>
             Back
          </div>
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
                  Update Organization
                </span>
                <span
                 className='text-[15px] text-zinc-500'
                 >
                  Enter New organization Name . If you'd like to update organization profile picture, you can upload a new one as well.
                </span>
              </div>
              <form
                onSubmit={handleUpdateOrg}
                className='flex flex-col w-full items-start gap-4 text-sm'
                >
                 <Input
                  className={"flex flex-col w-full gap-0.5"}
                  htmlFor={'Organization Name'}
                  labelClassName={'ml-0.5 text-[12px] font-medium'}
                  label={"Organization Name"}
                  type={'text'}
                  id={'Organization Name'}
                  onChange={(e)=>setOrgName(e.target.value)}
                  placeholder={"Name here . . . ."}
                  inputClassName={'bg-zinc-100 dark:bg-zinc-900 focus:border-blue-500/30 focus:bg-blue-500/10 outline-0 placeholder:text-zinc-500 placeholder:font-light font-medium p-2 rounded border border-zinc-300 dark:border-zinc-800'}
                 />
                 <Input
                  className={"flex flex-col w-full gap-0.5"}
                  htmlFor={'Description'}
                  labelClassName={'ml-0.5 text-[12px] font-medium'}
                  label={"Description"}
                  type={'text'}
                  id={'Description'}
                  onChange={(e)=>setDescription(e.target.value)}
                  placeholder={"description here . . . ."}
                  inputClassName={'bg-zinc-100 dark:bg-zinc-900 focus:border-blue-500/30 focus:bg-blue-500/10 outline-0 placeholder:text-zinc-500 placeholder:font-light font-medium p-2 rounded border border-zinc-300 dark:border-zinc-800'}
                 />
                 <Input
                  className={"flex flex-col w-full gap-0.5"}
                  htmlFor={'profileUpload'}
                  labelClassName={'ml-0.5 text-[12px] font-medium'}
                  label={"Uplode New profile picture !"}
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
                { orgError && <span
                 className='ml-0.5 text-sm text-red-500'
                 >
                  {orgError}
                </span>}
               <div 
                className='flex mt-4 w-full justify-center'
                >
                 {orgLoading ? (
                    <Loader
                     size='15px'
                     color='blue'
                     />
                 ):(
                    <Btn
                     text={"Update"}
                     className={"px-4 py-1 bg-blue-500 text-white rounded shadow-md hover:bg-blue-700 cursor-pointer"}
                     />
                 )}
                 </div>
              </form>
          </div>
        </div>
     </div>
  )
}

export default UpdateOrg