//import modules
import joi from "joi"
import { generalFields } from "../../middleware/validation.js"
import categoryRouter from "./category.router.js"

export const addCategoryval = joi.object({
    name:generalFields.name.required(),
    
})

export const updateCategoryval = joi.object({
    name:generalFields.name,
    categoryId:generalFields.objectId.required(),
})


export const deleteCategoryval = joi.object({
    categoryId:generalFields.objectId.required(),
})