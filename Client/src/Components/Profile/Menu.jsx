import React from 'react'

const Menu = ({icon, text, style, onClick, secondIcon}) => {

  return (
    <div
     onClick={onClick}
     className={`${style} flex items-center p-2 rounded gap-4 justify-between hover:bg-zinc-500/20`} 
     >
      <div className='flex gap-2 items-center'>
         <i>{icon}</i>
         <span>{text}</span>
      </div>
      <i>
        {secondIcon}
      </i>
    </div>
  )
}

export default Menu;