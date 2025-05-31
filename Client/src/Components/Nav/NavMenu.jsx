import React from 'react'

const NavMenu = ({icon, text, className, onClick, icon2}) => {
  return (
    <div
     onClick={onClick} 
     className={`${className} flex gap-2 p-2 items-center justify-between`}>
       <div className='flex gap-2 items-center'>
        {icon}
        {text}
       </div>
        {icon2}
    </div>
  )
}

export default NavMenu;