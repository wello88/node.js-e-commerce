import { Product } from "../../../db/models/product.model.js"
import { User } from "../../../db/models/user.model.js"
import { AppError } from "../../utils/apperror.js"
import { messages } from "../../utils/constant/messages.js"

// Get wishlist with populated products
export const getWishlist = async (req, res, next) => {
    const user = await User.findById(req.authUser._id)
        .select('wishlist')
        .populate({
            path: 'wishlist',
            select: 'title slug price discount mainImage stock'
        })

    if (!user) {
        return next(new AppError(messages.user.notfound, 404))
    }

    // Calculate final prices for each product
    const wishlistProducts = user.wishlist.map(product => ({
        _id: product._id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        discount: product.discount,
        finalPrice: product.price - (product.price * ((product.discount || 0) / 100)),
        mainImage: product.mainImage,
        stock: product.stock,
        inStock: product.stock > 0
    }))

    return res.status(200).json({
        success: true,
        message: 'Wishlist retrieved successfully',
        data: wishlistProducts
    })
}

// Add to wishlist
export const addToWishlist = async (req, res, next) => {
    const { productId } = req.body

    // Check product exists
    const productExist = await Product.findById(productId)
    if (!productExist) {
        return next(new AppError(messages.product.notfound, 404))
    }

    const user = await User.findByIdAndUpdate(
        req.authUser._id,
        { $addToSet: { wishlist: productId } },
        { new: true }
    ).select('wishlist')

    return res.status(200).json({
        success: true,
        message: 'Product added to wishlist',
        data: user.wishlist
    })
}

// Remove from wishlist
export const deleteFromWishlist = async (req, res, next) => {
    const { productId } = req.params

    const user = await User.findByIdAndUpdate(
        req.authUser._id,
        { $pull: { wishlist: productId } },
        { new: true }
    ).select('wishlist')

    return res.status(200).json({
        success: true,
        message: 'Product removed from wishlist',
        data: user.wishlist
    })
}

// Check if product is in wishlist
export const isInWishlist = async (req, res, next) => {
    const { productId } = req.params

    const user = await User.findById(req.authUser._id).select('wishlist')
    const inWishlist = user.wishlist.includes(productId)

    return res.status(200).json({
        success: true,
        data: { inWishlist }
    })
}
