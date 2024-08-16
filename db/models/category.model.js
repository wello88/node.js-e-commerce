import { model, Schema } from "mongoose";

//schema
const categorySchema = new Schema(
    {
        name: {
            type: String,
            reqired: true,
            unique: true,
            lowercasr: true,
            trim: true
        },
        slug: {
            type: String,
            reqired: true,
            unique: true,
            lowercasr: true,
            trim: true

        },
        image: Object,
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required:true
        }




    }, {
    timestamps: true,
   toJSON:{virtuals:true},
   toObject:{virtuals:true}
}


)
categorySchema.virtual('subcategory', {
    ref: 'Subcategory',
    foreignField:'category',
    localField:'_id'

})

export const Category = model('Category', categorySchema)