import React from 'react'

const Header = ({title,subTitle} : {title:string,subTitle:string}) => {
  return (
    <div>
        <h1 className=' h2-bold text-dark-700' >{title}</h1>
        <h2 className='p-16-regular  mt-4' >{subTitle}</h2>
      
    </div>
  )
}

export default Header
