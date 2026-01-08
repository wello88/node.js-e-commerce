import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { asyncHandler } from "../../utils/apperror.js";
import { 
    addToCart, 
    removeFromCart, 
    getCart, 
    updateQuantity, 
    clearCart 
} from "./cart.controller.js";

const cartRouter = Router()

// Get cart
cartRouter.get('/get-cart',
    isAuthenticated(),
    asyncHandler(getCart)
)

// Add to cart
cartRouter.post('/add-to-cart',
    isAuthenticated(),
    asyncHandler(addToCart)
)

// Update quantity
cartRouter.put('/update-quantity',
    isAuthenticated(),
    asyncHandler(updateQuantity)
)

// Remove from cart
cartRouter.delete('/remove-from-cart/:productId',
    isAuthenticated(),
    asyncHandler(removeFromCart)
)

// Clear cart
cartRouter.delete('/clear-cart',
    isAuthenticated(),
    asyncHandler(clearCart)
)

export default cartRouter
