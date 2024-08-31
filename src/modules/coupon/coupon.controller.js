import { Coupon } from "../../../db/index.js"
import { AppError } from "../../utils/apperror.js"
import { CouponType } from "../../utils/constant/enums.js"
import { messages } from "../../utils/constant/messages.js"

//create coupon
export const createCoupon = async (req, res, next) => {
    //get data from req
    const { couponCode, discountAmount, type, fromDate, toDate } = req.body

    //check coipon
    const couponExist = await Coupon.findOne({ couponCode })
    if (couponExist) {
        return next(new AppError(messages.coupon.alreadyExist, 409))
    }
    if (type == CouponType.PERCENTAGE && discountAmount > 100) {
        return next(new AppError(messages.coupon.invalidAmount, 400))
    }

    //prepare data
    const coupon = new Coupon({
        couponCode,
        discountAmount,
        type,
        fromDate,
        toDate,
        createdBy: req.authUser._id
    })
    const createdCoupon = await coupon.save()
    if (!createdCoupon) {
        return next(new AppError(messages.coupon.failtocreate, 500))
    }
    return res.status(201).json({
        success: true,
        messages: messages.coupon.createSuccessfully,
        data: createdCoupon
    })


}


//update coupon

export const updateCoupon = async (req, res, next) => {
    //getdaata
    const { couponCode, discountAmount, type, fromDate, toDate } = req.body
    const { couponId } = req.params

    //check existance
    const couponExist = await Coupon.findById(couponId)
    if (!couponExist) {
        return next(new AppError(messages.coupon.notfound, 404))
    }

    //check name existance
    const couponCodeExist = await Coupon.findOne({ couponCode, _id: { $ne: couponId } })
    if (couponCodeExist) {
        return next(new AppError(messages.coupon.alreadyExist, 409))
    }
    if (type == CouponType.PERCENTAGE && discountAmount > 100) {
        return next(new AppError(messages.coupon.invalidAmount, 400))
    }

    //prepare data
    couponExist.couponCode = couponCode
    couponExist.discountAmount = discountAmount
    couponExist.type = type
    couponExist.fromDate = fromDate
    couponExist.toDate = toDate

    const updatedCoupon = await couponExist.save()
    if (!updatedCoupon) {
        return next(new AppError(messages.coupon.failtoupdate, 500))
    }
    return res.status(200).json({
        success: true,
        messages: messages.coupon.updateSuccessfully,
        data: updatedCoupon
    })

} 



//delete coupon

export const deleteCoupon = async (req, res, next) => {
    const { couponId } = req.params
    const couponExist = await Coupon.findById(couponId)
    if (!couponExist) {
        return next(new AppError(messages.coupon.notfound, 404))
    }
    const deletedCoupon = await Coupon.findByIdAndDelete(couponId)
    if (!deletedCoupon) {
        return next(new AppError(messages.coupon.failtoDelete, 500))
    }
    return res.status(200).json({
        success: true,
        messages: messages.coupon.deleteSuccessfully,
        data: deletedCoupon
    })
}