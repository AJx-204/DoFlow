import React from 'react';
import { Timeline } from './Views';
import { SelectOrg } from './Components';

const Topbar = () => {


  return (
    <>
     <div
       className='flex items-center sticky top-0 bg-zinc-100 dark:bg-zinc-900 w-full h-[49.5px] border-b-2 border-zinc-500/10 justify-between px-2'
       >
        <i></i>
        <div className='flex  items-center gap-2'>
           <Timeline/>
           <SelectOrg/>
         </div>
      </div>
    </>
  )
}

export default Topbar;