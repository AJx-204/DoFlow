
const Logo = ({ style }) => {
  return (
    <div>
      <span
       className={`${style} font-semibold`}
       >
        DoFlow
      </span>
      <span
       className='text-sm text-zinc-500 font-medium'
       >
        .app
      </span>
    </div>
  )
}

export default Logo;