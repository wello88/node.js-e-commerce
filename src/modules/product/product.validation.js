import joi from "joi"
import { generalFields } from "../../middleware/validation.js"

const parseArr = (value, helper) => {
    value = JSON.parse(value)
    const schema = joi.array().items(joi.string())
    const { error } = schema.validate(value, { abortEarly: false })
    if (error) {
        return helper('invalid value')
    }
    else {
        return true
    }
}

export const createProductVal = joi.object({
    title: generalFields.name.required(),
    titleAr: generalFields.name,  // Arabic title - optional
    description: generalFields.name.required(),
    descriptionAr: generalFields.name,  // Arabic description - optional
    category: generalFields.objectId.required(),
    subcategory: generalFields.objectId,  // Optional
    brand: generalFields.objectId,  // Optional
    price: joi.number().required(),
    discount: joi.number(),
    size: joi.custom(parseArr),
    colors: joi.custom(parseArr),
    stock: joi.number().min(0)
}).required()

export const updateProductVal = joi.object({
    title: generalFields.name,
    titleAr: generalFields.name,  // Arabic title - optional
    description: generalFields.name,
    descriptionAr: generalFields.name,  // Arabic description - optional
    category: generalFields.objectId,
    subcategory: generalFields.objectId,
    brand: generalFields.objectId,
    price: joi.number(),
    discount: joi.number(),
    size: joi.custom(parseArr),
    colors: joi.custom(parseArr),
    stock: joi.number().min(0),
    productId: generalFields.objectId.required()
})