
import { Schema } from "mongoose";
import { Document, Types } from 'mongoose';

import { model, models } from "mongoose";

export interface IImage extends Document {
    title: string;
    transformationType: string;
    publicId: string;
    secureURL: string;
    width?: number;
    height?: number;
    aspectRatio?: string;
    prompt?: string;
    config?: Record<string, unknown>; // Object type in TypeScript
    transformationUrl?: string;
    colour?: string;
    author?: {
        _id: string;
        firstname: string;
        lastname: string;

    }; // ObjectId type from mongoose
    createdAt: Date;
    updatedAt: Date;
}


const ImageSchema= new Schema({
    title:{type:String,required:true},
    transformationType: {type: String, required:true},
    publicId:{type: String, required:true},
    secureURL:{type: String, required:true},
    width:{type: Number},
    height:{type: Number},
    aspectRatio:{type: String},
    prompt:{type: String},
    config:{type: Object},
    transformationUrl:{type: String},
    colour:{type: String},
    author: { type:Schema.Types.ObjectId,ref:'User'},
    createdAt:{type:Date, default:Date.now},
    updatedAt:{type:Date, default:Date.now}

})
const Image= models?.Image||model('Image',ImageSchema)

export default Image