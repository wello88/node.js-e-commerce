//import modules
import joi from "joi"
import { generalFields } from "../../middleware/validation.js"

export const addCategoryval = joi.object({
    name: generalFields.name.required(),
    nameAr: generalFields.name,  // Arabic name - optional
})

export const addCategoryCloudVal = joi.object({
    name: generalFields.name.required(),
    nameAr: generalFields.name,  // Arabic name - optional
})

export const updateCategoryval = joi.object({
    name: generalFields.name,
    nameAr: generalFields.name,  // Arabic name - optional
    categoryId: generalFields.objectId.required(),
})

export const updateCategoryCloudVal = joi.object({
    name: generalFields.name,
    nameAr: generalFields.name,  // Arabic name - optional
    categoryId: generalFields.objectId,
})

export const deleteCategoryval = joi.object({
    categoryId: generalFields.objectId.required(),
})