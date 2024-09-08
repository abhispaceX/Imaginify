import mongoose, {Mongoose} from "mongoose";

const Mongo_Url='mongodb+srv://abhiramgaddam13:DA6octpH8KhiC2xA@users.bj2r7dr.mongodb.net/?retryWrites=true&w=majority&appName=users'




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
        throw new Error("error in connecting to database")
    }

    cached.promise=mongoose.connect(Mongo_Url,{dbName:'Imaginify', bufferCommands:false})
    
    cached.conn=await cached.promise
    return cached.conn
}