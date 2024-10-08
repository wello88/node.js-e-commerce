import { Product, Review } from "../../../db/index.js"
import { ApiFeature } from "../../utils/apiFeature.js"
import { AppError } from "../../utils/apperror.js"
import { messages } from "../../utils/constant/messages.js"

//add review
export const addReview = async (req, res, next) => {
    // get data from reqq
    const { productId } = req.query
    const { comment, rate } = req.body
    //check exist
    const productExist = await Product.findById(productId)
    if (!productExist) {
        return next(new AppError(messages.product.notfound, 404))
    }    
    //check has review wla la
    const reviewExist = await Review.findOneAndUpdate({ user: req.authUser._id, product: productId },
        { comment, rate }, { new: true }
    )
    let message = messages.review.updateSuccessfully
    let data = reviewExist
    if(!reviewExist){
        const review = new Review({
            comment,
            rate,
            user: req.authUser._id,
            product: productId
        })
       const createdReview =  await review.save()
       if(!createdReview){
           return next(new AppError(messages.review.failtocreate, 500))
       }
       message = messages.review.createSuccessfully
       data = createdReview
    }
    return res.status(200).json({
        success: true,
        message,
        data: data

    })
}


//get all reviews with pagination
export const getReviews = async (req, res, next) => {

    const apiFeature = new ApiFeature(Review.find(), req.query).pagination().sort().select().filter()

    const review = await apiFeature.mongooseQuery

    return res.status(200).json({
        message: messages.review.getsuccessfully,
        success: true,
        data: review
    })
}



//delete reviews with auth and authorizationn
export const deleteReview = async (req, res, next) => {
    // get data from req
    const {reviewId} = req.params
    // check existance
    const reviewExist = await Review.findById(reviewId)
    if (!reviewExist) {
        return next(new AppError(messages.review.notfound, 404))
    }
    // check user
    if (reviewExist.user.toString() !== req.authUser._id.toString()) {
        return next(new AppError(messages.review.notauthorized, 400))
    }
    // delete review
    const deletedReview = await Review.findByIdAndDelete(reviewId)
    if (!deletedReview) {
        return next(new AppError(messages.review.failtoDelete, 400))
    }
    // send response
    return res.status(200).json({
        message: messages.review.deleteSuccessfully,
        success: true
    })

}
