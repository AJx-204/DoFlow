import React from 'react'

const Input = ({
    className,
    htmlFor,
    labelClassName,
    label,
    type,
    value,
    id,
    accept,
    onChange,
    placeholder,
    inputClassName,
    required,
    SecondLabelClassName,
    SecondLabel
}) => {
  return (
    <div
     className={className}
     >
      <label
       className={labelClassName} 
       htmlFor={htmlFor}
       >
        {label}
      </label>
      <input 
       type={type}
       value={value}
       id={id}
       accept={accept}
       onChange={onChange}
       placeholder={placeholder}
       className={inputClassName}
       required={required}
       />
       <label
        htmlFor={htmlFor}
        className={SecondLabelClassName}
        >
         {SecondLabel}
       </label>
    </div>
  )
}

export default Input;