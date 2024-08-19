import { Cart, Product } from "../../../db/index.js"
import { AppError } from "../../utils/apperror.js"
import { messages } from "../../utils/constant/messages.js"


//add to cart

export const addToCart = async (req, res, next) => {

    const { productId, quantity } = req.body


    //check product exist
    const productExist = await Product.findById(productId)
    if (!productExist) {
        return next(new AppError(messages.product.notfound, 404))
    }



    //check stock
    if (!productExist.inStock(quantity)) {
        return next(new AppError(messages.product.outOfStock, 400))
    }



    //check cart
    const userCart = await Cart.findOneAndUpdate(
    {user:req.authUser._id, 'products.productId': productId},
    {$set: { "products.$.quantity": quantity }},
    {new: true}
)

    if (!userCart) {
        userCart = await Cart.findOneAndUpdate(
        { user: req.authUser._id },
        { $push: { products: { productId, quantity } } },
        { new: true, upsert: true } )// `upsert: true` ensures a cart is created if it doesn't exist

    }

    return res.status(200).json({ success: true, message: 'done', data:userCart })


}