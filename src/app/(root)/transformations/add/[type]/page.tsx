import React from 'react'
import Header from '@/components/Shared/Header'
import { transformationTypes } from '@/constants'
import TransformationForm from '@/components/Shared/TransformationForm'
import { auth } from '@clerk/nextjs/server'
import { getUserById } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation'

const AddTransformationTypePage =  async ({params:{type}}:SearchParamProps) => {
  const Transformations=transformationTypes[type]

  const {userId }= auth()
  if (!userId) redirect ('/sign-in')
  const user = await getUserById(userId)
  return (
    <div>
        <Header title={Transformations.title} subTitle={Transformations.subTitle}/>

        <TransformationForm
          action="Add"
          userId={user._id}
          type={Transformations.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      
    </div>
  )
}

export default AddTransformationTypePage
