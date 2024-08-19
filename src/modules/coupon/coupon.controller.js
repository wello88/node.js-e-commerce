import { Coupon } from "../../../db/index.js"
import { AppError } from "../../utils/apperror.js"
import { CouponType } from "../../utils/constant/enums.js"
import { messages } from "../../utils/constant/messages.js"

//create coupon
export const createCoupon = async (req, res, next) => {
    //get data from req
    const {couponCode,couponAmount,couponType,fromDate,toDate}=req.body

    //check coipon
    const couponExist = await Coupon.findOne({couponCode})
    if(couponExist){
        return next(new AppError(messages.coupon.alreadyExist, 409))
    }
    if(couponType==CouponType.PERCENTAGE && couponAmount>100){
        return next(new AppError(messages.coupon.invalidAmount, 400))
    }

    //prepare data
    const coupon = new Coupon({
        couponCode,
        couponAmount,
        couponType,
        fromDate,
        toDate,
        createdBy:req.authUser._id
    })
    const createdCoupon = await coupon.save()
    if(!createdCoupon){
        return next(new AppError(messages.coupon.failtocreate, 500))
    }
    return res.status(201).json({
        success: true,
        messages: messages.coupon.createSuccessfully,
        data:createdCoupon
    })


}