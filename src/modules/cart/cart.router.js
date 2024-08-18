import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { asyncHandler } from "../../utils/apperror.js";
import { addToCart } from "./cart.controller.js";

const cartRouter = Router()

//add to cart

cartRouter.post('/add-to-cart',
    isAuthenticated(),
    asyncHandler(addToCart)
)


export default cartRouter