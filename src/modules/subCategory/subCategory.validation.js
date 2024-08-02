//create subcategory validation
import joi from "joi";
import { generalFields } from "../../middleware/validation.js";


export const subCategoryVal = joi.object({
    name:generalFields.name.required(),
    category:generalFields.objectId.required(),
    //todo createdBy:generalFields.objectId.required()

    
})
//get subcategory validation
export const get_sub_catVal = joi.object({
    
    categoryId:generalFields.objectId.required(),

})