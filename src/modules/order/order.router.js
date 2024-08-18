import { Router } from "express";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "../../utils/constant/enums.js";
import { asyncHandler } from "../../utils/apperror.js";
import { createOrder } from "./order.controller.js";

const orderRouter = Router();

//create order
orderRouter.post('/create-order',
    isAuthenticated(),
    isAuthorized(Object.values(roles)),
    asyncHandler(createOrder)
)
export default orderRouter