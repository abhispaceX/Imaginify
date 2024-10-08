"use client"
 
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"


import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from '../../constants';


import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Input } from "@/components/ui/input"
import { CustomField } from "./CustomField"
import { useEffect, useState, useTransition } from "react"
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils"
import { updateCredits } from "@/lib/actions/user.actions"
import MediaUploader from "./mediaUploader"
import TransformedImage from "./TransformedImage"
import { getCldImageUrl } from "next-cloudinary"
import { addImage, updateImage } from "@/lib/actions/image.actions"

import { useRouter } from "next/navigation"
import { InsufficientCreditsModal } from "./InsufficientCreditsModal"

 
export const formSchema = z.object({
  title: z.string(),
  aspectRatio:z.string().optional(),
  color :z.string().optional(),
  prompt:z.string().optional(),
  publicId:z.string(),
  

})


const TransformationForm = ({action,data=null,userId,type,creditBalance,config=null}:TransformationFormProps) => {
  const transformationType= transformationTypes[type]
  const [image,setImage]=useState(data)
  const [isSubmiting,setIsSubmiting]=useState(false)
  const [isTransforming,setIsTransforming]=useState(false)
  const [newTransformation,setNewTransformation]=useState < Transformations|null>(null)
  const [transformationConifg, setTransformationConfig]= useState(config)
  const [ isPending, startTransition]=useTransition()
  const router = useRouter()
  const initialValues= data && action==='Update'?{
    title: data?.title,
    aspectRatio: data?.aspectRatio,
    color: data?.color,
    prompt: data?.prompt,
    publicId: data?.publicId

  }: defaultValues
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues
  })
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmiting(true)
    if(data || image){
      const transformationUrl=getCldImageUrl({
        
        width: image?.width,
        height: image?.height,
        src:image?.publicId,
        ...transformationConifg
      })
      const imageData={
        title: values.title,
        publicId: image?.publicId,
        transformationType: type,
        width: image?.width,
        height: image?.height,
        config: transformationConifg,
        secureURL: image?.secureURL,
        transformationURL:transformationUrl,
        aspectRatio: values.aspectRatio,
        prompt: values.prompt,
        color: values.color,
        userId: userId
      }
      if (action=== 'Add'){
        try{
          const newImage= await addImage({
            image:imageData,
            path: '/',
            userId
          })
          if (newImage){
            form.reset()
            setImage(data)
            router.push(`/transformations/${newImage._id}`)
          }

        }catch (error)
         {
          console.log(error)
        }
      }
      if (action === 'Update'){
        try{
          const newUpdateImage= await updateImage ({
            image:{...imageData,_id: data._id},
            path: '/',
            userId
          })
          if (newUpdateImage){
            router.push(`/transformations/${data._id}`)
          }

        }catch (error)
         {
          console.log(error)
        }
      }

    }
    setIsSubmiting(false)
    
  }
  const onSelectFieldHandler=(value:string, onChangeField:(value:string)=>void)=>{
    const imageSize= aspectRatioOptions[value as AspectRatioKey]

    setImage((prevState:any)=>({...prevState,aspectRatio:imageSize.aspectRatio, hieght: imageSize.height, width: imageSize.width}))
     setNewTransformation(transformationType.config)
     return onChangeField(value)
  }
  const onInputChangeHandler = (fieldName: string, value: string, type: string, onChangeField: (value: string) => void) => {
    debounce(() => {
      setNewTransformation((prevState: any) => ({
        ...prevState,
        [type]: {
          ...prevState?.[type],
          [fieldName === 'prompt' ? 'prompt' : 'to' ]: value 
        }
      }))
    }, 1000)();
      
    return onChangeField(value)
  }

  const onTransformationHandler= async()=>{
    setIsTransforming(true)
    setTransformationConfig(deepMergeObjects(newTransformation,transformationConifg))
    setNewTransformation(null)
    startTransition(async()=>{
      await updateCredits(userId,creditFee)
    })
   
  }
  useEffect(() => {
    if(image && (type === 'restore' || type === 'removeBackground')) {
      setNewTransformation(transformationType.config)
    }
  }, [image, transformationType.config, type])
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {creditBalance<Math.abs(creditFee) && <InsufficientCreditsModal/>}
      <CustomField
        control={form.control}
        name="title"
        formLabel=" Image Title"
        render={({ field }) =><Input {...field} className="input-field" />
        }
      
      />
      {type === 'fill' && (<>
        <CustomField
          control={form.control}
          name="aspectRatio"
          formLabel="Aspect Ratio"
          render={({field })=>(<Select value={field.value} onValueChange={(value)=>onSelectFieldHandler(value,field.onChange)} >
            <SelectTrigger className="select-field">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(aspectRatioOptions).map((key)=>(
              <SelectItem key={key} className="select-item"  value={key}>{aspectRatioOptions[key as AspectRatioKey].label}</SelectItem>))}
              
            </SelectContent>
          </Select>
          )}
        />
      </>)}
      {(type === 'remove'  || type === 'recolor') && (
          <div className="prompt-field">
            <CustomField 
              control={form.control}
              name="prompt"
              formLabel={
                type === 'remove' ? 'Object to remove' : 'Object to recolor'
              }
              className="w-full"
              render={({ field }) => (
                <Input 
                  value={field.value}
                  className="input-field"
                  onChange={(e) => onInputChangeHandler(
                    'prompt',
                    e.target.value,
                    type,
                    field.onChange
                  )}
                />
              )}
            />

          {type === 'recolor' && (
              <CustomField 
                control={form.control}
                name="color"
                formLabel="Replacement Color"
                className="w-full"
                render={({ field }) => (
                  <Input 
                    value={field.value}
                    className="input-field"
                    onChange={(e) => onInputChangeHandler(
                      'color',
                      e.target.value,
                      'recolor',
                      field.onChange
                    )}
                  />
                )}
              />
            )}
          </div>
        )}
      
      <div className="media-uploader-field">
        <CustomField
          control={form.control}
          name='publicId'
          className="flex flex-col  size-full"
          render={({field })=>(
            <MediaUploader
             onValueChange={field.onChange}
             publicId={field.value}
             setImage={setImage}
             image={image}
             type={type}

            />
    
          )}
          
        />
         <TransformedImage
          image={image}
          type={type}
          title={form.getValues().title}
          isTransforming={isTransforming}
          setIsTransforming={setIsTransforming}
          transformationConfig={transformationConifg}

    />
    </div>
   
      <Button type="button" className="submit-button capitalize" disabled={isTransforming || newTransformation===null} onClick={onTransformationHandler} >
        {isTransforming? 'Transforming...':'Apply Transformation'}
      </Button>

      <Button type="submit" className="submit-button capitalize" disabled={isSubmiting} >
        {isSubmiting? 'Submiting...':'Save Image'}
      </Button>
      </form>
    </Form>
  )
}

export default TransformationForm
