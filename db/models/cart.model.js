import { Schema,model } from "mongoose";


const cartSchema = new Schema({

    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true   
    },
    products:[{
        
        productId:{
            type:Schema.Types.ObjectId,
            ref:"Product"
        },
        quantity:Number,
        

    }]

},{timestamps:true})



export const Cart = model('Cart',cartSchema)