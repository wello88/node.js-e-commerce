import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { asyncHandler } from "../../utils/apperror.js";
import { addToCart, removeFromCart } from "./cart.controller.js";

const cartRouter = Router()

//add to cart

cartRouter.post('/add-to-cart',
    isAuthenticated(),
    asyncHandler(addToCart)
)
//remove from cart
cartRouter.put('/remove-from-cart',
    isAuthenticated(),
    asyncHandler(removeFromCart)
)

export default cartRouter