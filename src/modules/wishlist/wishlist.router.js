import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { addToWishlist, deleteFromWishlist } from "./wishlist.controller.js";
import { asyncHandler } from "../../utils/apperror.js";

const wishlistRouter = Router();

//add to wishlist

wishlistRouter.put('/add-to-wishlist',
    isAuthenticated(),
    asyncHandler(addToWishlist)

)


wishlistRouter.put('/deleteFromWishlist/:productId',
    isAuthenticated(),
    asyncHandler(deleteFromWishlist)
)

export default wishlistRouter