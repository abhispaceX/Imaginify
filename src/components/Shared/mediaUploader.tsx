"use client"
import React from 'react'
import { useToast } from '../ui/use-toast'
import { CldImage, CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { getImageSize,dataUrl } from "@/lib/utils"

import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props'

type MediaUploaderProps = {
    onValueChange:(value:string)=>void
    setImage: React.Dispatch<any>
    image:any
    publicId:string
    type:string
}

const MediaUploader = ({onValueChange,setImage,image,publicId,type}:MediaUploaderProps) => {
    const { toast }=useToast()
    const onUploadSuccessHnadler=(result:any)=>{
        setImage((prevState:any)=>({
            ...prevState,
            publicId:result?.info?.public_id,
            secureURL:result?.info?.secure_url,
            width:result?.info?.width,
            height:result?.info?.height

        }))
        onValueChange(result?.info?.public_id)
        toast({
            title: 'Image uploaded successfully',
            description: '1 credit was deducted from your account ',
            duration:5000,
            className:'success-toast'
          })
    }
    const onUploadErrorHnadler=()=>{
        toast({
            title: 'Something went wrong while uploading',
            description: 'Could not upload image',
            duration:5000,
            className:'error-toast'
          })
    }
  return (
    <CldUploadWidget  uploadPreset='abhi_imaginify' options={{multiple:false,resourceType:'image'}} onError={onUploadErrorHnadler} onSuccess={onUploadSuccessHnadler} >
       {({open})=>(<div className='flex flex-col gap-4'>
        <h3 className='h3-bold text-dark-600' >
           Original
        </h3>
        {publicId?
        (<>
          <div className=' cursor-pointer overflow-hidden  rounded-[10px]'>
            <CldImage
              src={publicId}
              width={getImageSize(type,image,"width")}
              height={getImageSize(type,image,"height")}
              alt='image'
              sizes={"100vw (max-width:767px) 50vw"}
              placeholder={dataUrl as PlaceholderValue}
              className='media-uploader_cldImage'
            />

            
          </div>
        </>):
        (<div className='media-uploader_cta' onClick={()=>open()} >
           <div className='media-uploader_cta-image'>
            <Image
              src='/assets/icons/add.svg'
              alt='add'
              width={24}
              height={24}
            />
            
           </div>
           <p className='p-14-medium' > Click here to upload Image </p>
        </div>)}
       </div>)}

    </CldUploadWidget>
  )
}

export default MediaUploader
