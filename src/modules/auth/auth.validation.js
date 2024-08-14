import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const loginval = joi.object({

phone:joi.string().when('email',{
    is:joi.required(),
    then:joi.optional(),
    otherwise:joi.required()
}),
email:generalFields.email,
password:generalFields.password,

})