import joi from "joi"
import { AppError } from "../utils/apperror.js"
export const generalFields = {
    name:joi.string(),
    objectId:joi.string().hex().length(24),
    email:joi.string().email(),
    password:joi.string(),
    repassword:joi.string().valid(joi.ref('password')),


}

export const isvalid = (schema) => {
    return (req, res, next) => {
        let data = {...req.body, ...req.params, ...req.query }
        const { error } = schema.validate(data, { abortEarly: false })
        if (error) {
            const errArr = []
            error.details.forEach(err => {
                errArr.push(err.message)
            })
            return next(new AppError(errArr, 400))
        }
        next()  
    }

}