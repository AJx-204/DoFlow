
const Btn = ({ text, className, onClick, type, icon}) => {
  return (
    <button
     type={type}
     onClick={onClick}
     className={`${className} cursor-pointer`}
     >
      {icon}
      {text}
    </button>
  )
}

export default Btn;