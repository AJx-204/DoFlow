import React, { useEffect, useRef } from 'react'
import { Btn, Loader } from '../../Components'

const Conform = ({title, p1, p2, cancelText, conformText, onCancel, onConform, danger, loding, error}) => {

  const conformRef = useRef();

  useEffect(()=>{
    const handleClickOutside = (e) => {
      if(conformRef.current && !conformRef.current.contains(e.target)){
        onCancel();
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    };
  },[])

  return (
    <div
     className='fixed top-0 left-0 w-screen h-screen bg-black/50 flex items-center justify-center z-100'
     >
      <div
       ref={conformRef}
       className='flex flex-col justify-between max-w-80 min-h-80 rounded bg-zinc-50 dark:bg-zinc-800 p-4 border border-zinc-400 shadow-md dark:border-zinc-700/60'
       >
        <div
         className='flex flex-col gap-2'
         >
          <h1
           className=' text-[20px] font-semibold text-zinc-700 dark:text-zinc-300'
           >
             {title}
          </h1>
          <p
           className='text-sm text-zinc-500 font-medium'
           >
            {p1}
          </p>
          <p
           className='text-sm text-zinc-600 dark:text-zinc-400 font-medium'
           >
             {p2}
          </p>
        </div>
        {error && <span className='text-sm text-red-500 items-start'> { error } </span>}
        <div
         className='flex gap-4 self-end'
         >
          {loding ? <Loader size='15px'/> : (
           <>
            <Btn
             onClick={onCancel}
             text={cancelText}
             className={'px-3 py-1 rounded border border-zinc-500/20 text-zinc-600 dark:text-zinc-400 hover:border-zinc-500/50 hover:bg-zinc-500/10'}
             />
            <Btn
             onClick={onConform}
             text={conformText}
             className={`px-3 py-1 rounded border border-zinc-500/20 
                ${ danger ? "text-red-500 hover:border-red-500/30 hover:bg-red-500/20":"text-green-500 hover:border-green-500/30 hover:bg-green-500/20"}`}
             />
           </>
           )}
        </div>
      </div>
    </div>
  )
}

export default Conform