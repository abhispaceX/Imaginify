import mongoose, {Mongoose} from "mongoose";

const Mongo_Url=process.env.MONGO_URI

interface MongooseConnection{
    conn: Mongoose|null
    promise: Promise<Mongoose>| null

}
let cached: MongooseConnection=(global as any).mongoose

if(!cached){
    cached=(global as any ).mongoose={
        conn:null, promise:null
    }
}

export const connectToDatabase= async()=>{
    if(cached.conn){
        console.log('conneted')
        return cached.conn

    }
    if(!Mongo_Url){
        throw new Error("Please define the MONGO_URI environment variable inside .env.local")
    }

    cached.promise=mongoose.connect(Mongo_Url,{dbName:'Imaginify', bufferCommands:false})
    
    cached.conn=await cached.promise
    return cached.conn
}