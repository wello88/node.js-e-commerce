//schema

import { model, Schema } from "mongoose";

const productSchema = new Schema({
    //---------------------title---------------------//

    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        trim: true

    },
    description: {
        type: String,
        required: true,
        trim: true

    },


    //------------------related ids-----------------//

    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true

    },
    subcategory: {
        type: Schema.Types.ObjectId,
        ref: "Subcategory",
        required: true
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false //todo true
    },
    updatedBY: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false //todo true
    },
    //--------------------images-------------------//
    mainImage: {
        type: String,
        required: true

    },
    subImages: [String],
    //-------------------price--------------------//
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        min: 0,
        default: 0
    },

    //--------------specifications---------------//


    size: [String],

    colors: [String],

    stock: {
        type: Number,
        min: 0,
        default: 1
    },


},
    {
        versionKey: false,
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }

    })


//virtuals

productSchema.virtual('finalPrice').get(function () {

    return this.price - (this.price * ((this.discount || 0) / 100))

})


//model 
export const Product = model('Product',productSchema)