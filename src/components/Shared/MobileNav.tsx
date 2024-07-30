"use client"
import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
  import Link from 'next/link'
import { SignedIn, UserButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { navLinks } from '@/constants'
  

const MobileNav = () => {
  const pathName=usePathname()
  return (
    <header className='header ' >
        <Link href='/' className='flex items-center gap-2 md:py-2' >
        <img src='/assets/images/logo-text.svg' alt='logo' width={150}  height={24}/>
        </Link>
        <nav className=' flex gap-2' >
        <SignedIn>
            <UserButton/>
            <Sheet>
                <SheetTrigger>
                    <img src='/assets/icons/menu.svg' />
                </SheetTrigger>
                <SheetContent className='sheet-comtent sm:w-64 overflow-y-scroll ' >
                    <img src='/assets/images/logo-text.svg' alt='logo' width={90}  height={28}/>
                
          <ul className=' header-nav_elements overflow-scroll ' >
            {navLinks. map((link)=>{
              const isActive= link.route === pathName
              return(<li key={link.route} className={`${isActive && 'gradient-text'} p-18 flex whitespace-nowrap text-dark-400  `} >
                <Link href={link.route} className=' sidebar-link  cursor-pointer    ' >
                  <img src={link.icon} alt={link.label} width={24} height={24} />
                  <span className=' sidebar-nav-label ' >{link.label}</span>
                </Link>
              </li>)
            })}
          </ul>

        
                </SheetContent>
            </Sheet>

        </SignedIn>
        </nav>
      
    </header>
  )
}

export default MobileNav
