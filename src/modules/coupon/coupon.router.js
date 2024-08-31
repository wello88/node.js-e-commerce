import { Router } from "express";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { isvalid } from "../../middleware/validation.js";
import { roles } from "../../utils/constant/enums.js";
import { createCouponVal } from "./coupon.validation.js";
import { asyncHandler } from "../../utils/apperror.js";
import { createCoupon, deleteCoupon, updateCoupon } from "./coupon.controller.js";

const couponRouter = Router();

//add coupon

couponRouter.post('/create-coupon',

isAuthenticated(),
isAuthorized([roles.ADMIN]),
isvalid(createCouponVal),
asyncHandler(createCoupon)
)
//update coupon
couponRouter.put('/update-coupon/:couponId',
isAuthenticated(),
isAuthorized([roles.ADMIN]),
asyncHandler(updateCoupon)
)

//delete coupon

couponRouter.delete('/delete-coupon/:couponId',
isAuthenticated(),
isAuthorized([roles.ADMIN]),
asyncHandler(deleteCoupon)
)




export default couponRouter