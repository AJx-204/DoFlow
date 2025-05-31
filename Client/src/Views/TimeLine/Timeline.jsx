import React, { useEffect, useRef, useState } from 'react'
import { MdOutlineTimeline } from 'react-icons/md';
import useOrg from '../../Context/OrgContext';
import { formatDistanceToNow } from 'date-fns';
import { IoMdClose } from "react-icons/io";


const Timeline = () => {

  const { orgData } = useOrg();

  const [showTimeLines, setShowTimeLines] = useState(false)
  const TimelineRef = useRef();

  useEffect(()=>{
    const handelOutSideClick = (e) => {
       if(TimelineRef.current && !TimelineRef.current.contains(e.target)){
           setShowTimeLines(false)
       }
    }
    document.addEventListener('mousedown', handelOutSideClick);
    return () => document.addEventListener('mousedown', handelOutSideClick);
    
  },[])

  return (
    <>
      <div
       onClick={()=>setShowTimeLines(!showTimeLines)} 
       className={`${showTimeLines ? "border-zinc-500" : "hover:border-zinc-500 border-zinc-500/30"} p-1.5 cursor-pointer flex items-center group justify-center shadow-md rounded-full border z-100`}>
        <MdOutlineTimeline size={17}/>
        <span className='absolute group-hover:flex hidden top-11 text-xs px-2 py-1 bg-zinc-500/20 border border-zinc-500/50 backdrop-blur-2xl rounded-md'>Time Line</span>
      </div>
      {showTimeLines && 
      <div 
       ref={TimelineRef}
       className='scrollbar-hidden absolute top-11 right-2 w-[350px] h-[90vh] bg-zinc-50 dark:bg-zinc-900 border border-zinc-500/50 rounded-lg shadow-md overflow-y-auto z-100'
       >
        <div className="flex justify-between items-center px-4 py-3 sticky top-0 border-b border-zinc-500/50 text-sm bg-zinc-200 dark:bg-zinc-950  font-semibold dark:font-normal ">
          Time-Line
          <i
           onClick={()=>setShowTimeLines(false)} 
           className='p-1 rounded-full hover:bg-zinc-500/30 cursor-pointer'>
            <IoMdClose size={18}/>
          </i>
        </div>
        {[...orgData?.timeline || []].reverse().map((item) => (
          <div key={item._id} className="text-[13px] border-b pb-2 border-zinc-500/15 p-4">
            <div
              className='text-zinc-700 dark:text-zinc-300 dark:font-light'
              dangerouslySetInnerHTML={{ __html: item.text }}
            />
            <div className="text-[10px] text-zinc-500 mt-1">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </div>
          </div>
        ))}
      </div>
      }
    </>
  )
}

export default Timeline;