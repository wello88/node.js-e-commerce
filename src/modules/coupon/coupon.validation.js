import joi from "joi"
import { CouponType } from "../../utils/constant/enums.js"

export const createCouponVal = joi.object({
    couponCode:joi.string().length(6).required(),
    discountAmount:joi.number().positive().min(1),
    type:joi.string().valid(CouponType.PERCENTAGE,CouponType.FIXED),
    fromDate:joi.date().greater(Date.now()-(24*60*60*1000)),
    toDate:joi.date().greater(joi.ref("fromDate"))
}).required()