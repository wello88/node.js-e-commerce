import { Product } from "../../../db/models/product.model.js"
import { User } from "../../../db/models/user.model.js"
import { AppError } from "../../utils/apperror.js"
import { messages } from "../../utils/constant/messages.js"

//add to wishlist
export const addToWishlist = async (req, res, next) => {

    //get data from req
    const { productId } = req.body
    const { authUser } = req
    //check existance
    const productExist = await Product.findById(productId)
    if (!productExist) {
        return next(new AppError(messages.product.notfound, 404))
    }
    const user = await User.findByIdAndUpdate(
        req.authUser._id,
        { $addToSet: { wishlist: productId } }
        , { new: true }
    )
    return res.status(200).json({
        success: true,
        data: user,
        message: messages.wishlist.addToWishlist
    })




}



//delete from wishlist

export const deleteFromWishlist = async (req, res, next) => {
    //get data from req
    const { productId } = req.params
    const user = await User.findByIdAndUpdate(req.authUser._id, {
        $pull: { wishlist: productId }
    }, { new: true }).select('wishlist')

    return res.status(200).json({
        success: true,
        data: user,
        message: messages.wishlist.deleteSuccessfully
    })
}