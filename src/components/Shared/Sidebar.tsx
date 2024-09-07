"use client"
import React from 'react'
import Link from 'next/link'
import { navLinks } from '@/constants'
import { usePathname } from 'next/navigation'

const Sidebar = () => {
  const pathName=usePathname()
  return (
    <aside className='fixed z-0 sidebar' >

      <div className=' flex flex-col gap-4 ' >
        <Link href='/' className=' sidebar-logo'>
        <img src='/assets/images/logo-text.svg' alt='logo' width={180}  height={28}/>
        </Link>
        <nav className='sidebar-nav' >
          <ul className=' sidebar-nav_elements ' >
            {navLinks.slice(0,6). map((link)=>{
              const isActive= link.route === pathName
              return(<li key={link.route} className={` sidebar-nav_element group ${isActive? 'bg-purple-gradient text-white': 'text-gray-600'}`} >
                <Link href={link.route} className={`sidebar-link ${isActive? 'hover: bg-purple-gradient text-white rounded-full':  ' hover:bg-gray-100 rounded-full'} `} >
                  <img src={link.icon} alt={link.label} className={`${isActive && 'brightness-700'}`} />
                  <span className=' sidebar-nav-label ' >{link.label}</span>
                </Link>
              </li>)
            })}
          </ul>

          <ul className=' sidebar-nav_elements  ' >
            {navLinks.slice(6). map((link)=>{
              const isActive= link.route === pathName
              return(<li key={link.route} className={` sidebar-nav_element group ${isActive? 'bg-purple-gradient text-white': 'text-gray-600'}`} >
                <Link href={link.route} className=' sidebar-link ' >
                  <img src={link.icon} alt={link.label} className={`${isActive && 'brightness-200'}`} />
                  <span className=' sidebar-nav-label ' >{link.label}</span>
                </Link>
              </li>)
            })}
          </ul>

        </nav>
      </div>
      
    </aside>
  )
}

export default Sidebar
