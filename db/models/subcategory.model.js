import { model, Schema } from "mongoose";

const subcategorySchema = new Schema({
    name:{
        type:String,
        reqired:true,
        unique:true,
        lowercasr:true,
        trim:true
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    image: {
        path: String
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        // required: true
    },
    category:{
        type:Schema.Types.ObjectId,
        ref:"Category",
        required:true
    }
    
},{timestamps:true})

export const Subcategory = model("Subcategory",subcategorySchema)