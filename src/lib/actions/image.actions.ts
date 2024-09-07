
"use server"
import { redirect } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';


import { revalidatePath } from "next/cache";
import User from "../Database/models/user.model";
import Image from "../Database/models/image.model";
import { v2 as cloudinary} from "cloudinary"

import { connectToDatabase } from "../Database/mongoose"

const populate= (query:any)=>query.populate({
    path:'author',
    model:'User',
    select:' _id firstname lastname clerkId'
})


export async function addImage({image,path,userId}:AddImageParams) {
    try{
    await connectToDatabase();
    const author = await User.findById(userId);
    if(!author ){
        throw new Error("Author not found")
    }

    const newImage = await Image.create({
        ...image,
        author:author._id,
    })
    revalidatePath(path)

    return JSON.parse(JSON.stringify(newImage))
    }catch(err){
    throw new Error("Image not created")
}
}

export async function updateImage({image,path,userId}:UpdateImageParams) {
    try{
    await connectToDatabase();
    const imageToUpdate = await Image.findById(image._id);
    if(!imageToUpdate || imageToUpdate.author.toHexString()!== userId ){
        throw new Error("Image not found")
    }

    const updatedImage = await Image.findByIdAndUpdate(
        imageToUpdate._id,
        image,
        {new:true}
    )
    revalidatePath(path)

    return JSON.parse(JSON.stringify(updatedImage))
    } catch(err){
    throw new Error("Image not created")
}
}
//delete

export async function deleteImage(imageId:string) {
    try{
    await connectToDatabase();
     

    await Image.findByIdAndDelete(imageId)
   
   
    } catch(err){
    throw new Error("Image not created")
}
finally{
    redirect('/')
}
}
// Get Image

export async function getImage(imageId:string) {
    try{
    await connectToDatabase();
     
    const image = await populate(Image.findById(imageId))
    if(!image){
        throw new Error("Image not found")
    }
    return JSON.parse(JSON.stringify(image))
    } catch(err){
    throw new Error("Image not created")

} 
}

export async function getAllImages({limit= 9,searchQuery='',page=1}:{limit?:number,page?:number,searchQuery?:string}) {
    try{
    await connectToDatabase();
     
    cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    })
    let expression='folder=imaginify'

    if(searchQuery){
        expression +=`AND${searchQuery}`
    }
     const { resources }= await cloudinary.search
     .expression(expression)
     .execute()

     const resoruceId= resources.map((resource:any)=>resource.public_id)

     let query={}

     if(searchQuery){
        query={publicId:{$in:resoruceId}}
     }
     const skipAmount=(Number(page)-1)*limit

     const images= await populate(Image.find(query))
     .skip(skipAmount)
     .limit(limit)
     .sort({createdAt:-1})
      const totalImages= await Image.find(query).countDocuments()
      const savedImages= await Image .find().countDocuments()

    return {data: JSON.parse(JSON.stringify(images)),totalPage: Math.ceil(totalImages/limit) ,savedImages}
    
    } catch(err){
    throw new Error("Image not created")

} 
}
export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: {
  limit?: number;
  page: number;
  userId: string;
}) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populate(Image.find({ author: userId }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    throw new Error ("Failed to fetch user images");
  }
}