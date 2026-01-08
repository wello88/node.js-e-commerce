import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { addToWishlist, deleteFromWishlist, getWishlist, isInWishlist } from "./wishlist.controller.js";
import { asyncHandler } from "../../utils/apperror.js";

const wishlistRouter = Router();

// Get wishlist
wishlistRouter.get('/get-wishlist',
    isAuthenticated(),
    asyncHandler(getWishlist)
)

// Check if product is in wishlist
wishlistRouter.get('/check/:productId',
    isAuthenticated(),
    asyncHandler(isInWishlist)
)

// Add to wishlist
wishlistRouter.post('/add-to-wishlist',
    isAuthenticated(),
    asyncHandler(addToWishlist)
)

// Remove from wishlist
wishlistRouter.delete('/remove/:productId',
    isAuthenticated(),
    asyncHandler(deleteFromWishlist)
)

export default wishlistRouter
