// import joi from "joi"
// import { payment } from "../../utils/constant/enums.js"
// import { generalFields } from "../../middleware/validation.js"


// export const createOrderVal = joi.object({
//     address:joi.object({
//         phone:joi.string(),
//         street:joi.string()
//     }).required(),
//     payment:joi.string().valid(...Object.values(payment)),
//     coupon:joi.object({
//         couponCode:joi.string(),
//         couponId:generalFields.objectId,
//         couponAmount:joi.number()
//     })
// })  