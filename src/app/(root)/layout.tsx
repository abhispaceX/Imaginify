import React from 'react'
import Sidebar from '@/components/Shared/Sidebar'
import MobileNav from '@/components/Shared/MobileNav'
import { Toaster } from "@/components/ui/toaster"




const Layout = ( {children}:{children: React.ReactNode} ) => {
  return (
    <main className='root' >
        <Sidebar />
        <MobileNav/>
        <div className='rootContainer lg:ml-80' >
            <div className='wrapper' >
            {children}
            <Toaster />
            </div>
        </div>
    </main>
  )
}

export default Layout
