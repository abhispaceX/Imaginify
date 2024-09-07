
import { navLinks } from '@/constants'
import React from 'react'
import Link from 'next/link'
import { getAllImages } from '@/lib/actions/image.actions'
import { Collection } from '@/components/Shared/Collections'



const Home = async ({searchParams}:SearchParamProps) => {
  const page= Number(searchParams.page) ||1
  const searchQuery= (searchParams.query as string ) || ''

  const images= await getAllImages({page,searchQuery})

  return (
    <>
    <section className='home overflow-y-scroll' >
      <h1 className='home-heading' >
        Unleash your creative vision with Imaginify
      </h1>
      <ul className='flex-center gap-20 w-full' >
        {navLinks.slice(1,5).map((link)=>(
          <Link key={link.route} href={link.route} className=' flex-center flex-col gap-4' >
            <li className=' rounded-full bg-white p-4  flex-center' >
              <img src={link.icon} alt='image ' 
               width={24} height={24}
              />
            </li>
            <p className='p-14-medium text-center text-white' > {link.label}</p>
          </Link>
        ))}
      </ul>
      
     
    </section>
  <section className='sm:mt-12 overflow-y-auto ' >
 <Collection
   hasSearch={true}
   images={images?.data}
   totalPages={images?.totalPage}
   page={page}
 />
  </section  >
    </>
  )
}

export default Home
