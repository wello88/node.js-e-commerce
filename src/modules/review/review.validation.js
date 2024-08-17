//add review 

import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const addReviewVal = joi.object({
    comment:generalFields.comment.required(),
    rate:joi.number().min(0).max(5).required(),
    productId:generalFields.objectId.required()
}).required()