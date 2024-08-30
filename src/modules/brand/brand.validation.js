import joi from "joi"
import { generalFields } from "../../middleware/validation.js"

export const createBrandVal = joi.object({
    
    name:generalFields.name.required(),
    createdBy:generalFields.objectId.required(),


}).required()


export const updateBrandval = joi.object({

    name:generalFields.name.required(),
    brandId:generalFields.objectId.required(),

}).required()