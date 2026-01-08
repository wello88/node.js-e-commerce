    import joi from 'joi'
    import { generalFields } from '../../middleware/validation.js'

    export const loginval = joi.object({
    phone: joi.string().optional().allow('', null),
    email: generalFields.email.optional(),
    password: generalFields.password.required(),
    }).or('email', 'phone') // At least one of email or phone must be provided