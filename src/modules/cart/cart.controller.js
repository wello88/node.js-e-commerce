import { Cart, Product } from "../../../db/index.js"
import { AppError } from "../../utils/apperror.js"
import { messages } from "../../utils/constant/messages.js"

// Get cart with populated products
export const getCart = async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.authUser._id })
        .populate({
            path: 'products.productId',
            select: 'title slug price discount mainImage stock'
        })

    if (!cart) {
        // Create empty cart if doesn't exist
        cart = await Cart.create({ user: req.authUser._id, products: [] })
    }

    // Calculate totals
    let subtotal = 0
    let totalItems = 0
    const cartProducts = cart.products
        .filter(item => item.productId) // Filter out any null products
        .map(item => {
            const product = item.productId
            const finalPrice = product.price - (product.price * ((product.discount || 0) / 100))
            const itemTotal = finalPrice * item.quantity
            subtotal += itemTotal
            totalItems += item.quantity
            return {
                productId: product._id,
                title: product.title,
                slug: product.slug,
                price: product.price,
                discount: product.discount,
                finalPrice,
                mainImage: product.mainImage,
                stock: product.stock,
                quantity: item.quantity,
                itemTotal
            }
        })

    return res.status(200).json({
        success: true,
        message: 'Cart retrieved successfully',
        data: {
            _id: cart._id,
            products: cartProducts,
            totalItems,
            subtotal,
            total: subtotal
        }
    })
}

// Add to cart
export const addToCart = async (req, res, next) => {
    const { productId, quantity = 1 } = req.body

    // Check product exists
    const productExist = await Product.findById(productId)
    if (!productExist) {
        return next(new AppError(messages.product.notfound, 404))
    }

    // Check stock
    if (!productExist.inStock(quantity)) {
        return next(new AppError(messages.product.outOfStock, 400))
    }

    // Try to update existing product in cart
    let userCart = await Cart.findOneAndUpdate(
        { user: req.authUser._id, 'products.productId': productId },
        { $set: { "products.$.quantity": quantity } },
        { new: true }
    )

    // If product not in cart, add it
    if (!userCart) {
        userCart = await Cart.findOneAndUpdate(
            { user: req.authUser._id },
            { $push: { products: { productId, quantity } } },
            { new: true, upsert: true }
        )
    }

    // Populate and return cart
    userCart = await Cart.findById(userCart._id).populate({
        path: 'products.productId',
        select: 'title slug price discount mainImage stock'
    })

    return res.status(200).json({ 
        success: true, 
        message: 'Product added to cart', 
        data: userCart 
    })
}

// Update quantity
export const updateQuantity = async (req, res, next) => {
    const { productId, quantity } = req.body

    if (quantity < 1) {
        return next(new AppError('Quantity must be at least 1', 400))
    }

    // Check product exists and has stock
    const productExist = await Product.findById(productId)
    if (!productExist) {
        return next(new AppError(messages.product.notfound, 404))
    }

    if (!productExist.inStock(quantity)) {
        return next(new AppError(messages.product.outOfStock, 400))
    }

    const userCart = await Cart.findOneAndUpdate(
        { user: req.authUser._id, 'products.productId': productId },
        { $set: { "products.$.quantity": quantity } },
        { new: true }
    ).populate({
        path: 'products.productId',
        select: 'title slug price discount mainImage stock'
    })

    if (!userCart) {
        return next(new AppError('Product not found in cart', 404))
    }

    return res.status(200).json({ 
        success: true, 
        message: 'Quantity updated', 
        data: userCart 
    })
}

// Remove from cart
export const removeFromCart = async (req, res, next) => {
    const { productId } = req.params

    const userCart = await Cart.findOneAndUpdate(
        { user: req.authUser._id },
        { $pull: { products: { productId } } },
        { new: true }
    ).populate({
        path: 'products.productId',
        select: 'title slug price discount mainImage stock'
    })

    if (!userCart) {
        return next(new AppError('Cart not found', 404))
    }

    return res.status(200).json({ 
        success: true, 
        message: 'Product removed from cart', 
        data: userCart 
    })
}

// Clear cart
export const clearCart = async (req, res, next) => {
    const userCart = await Cart.findOneAndUpdate(
        { user: req.authUser._id },
        { $set: { products: [] } },
        { new: true }
    )

    if (!userCart) {
        return next(new AppError('Cart not found', 404))
    }

    return res.status(200).json({ 
        success: true, 
        message: 'Cart cleared', 
        data: userCart 
    })
}
