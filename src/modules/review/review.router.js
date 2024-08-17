import { Router } from "express";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { isvalid } from "../../middleware/validation.js";
import { addReviewVal } from "./review.validation.js";
import { asyncHandler } from "../../utils/apperror.js";
import { addReview, deleteReview, getReviews } from "./review.controller.js";
import { roles } from "../../utils/constant/enums.js";

const reviewRouter = Router();

//add review
reviewRouter.post('/add-review',
    isAuthenticated(),
    isvalid(addReviewVal),
    asyncHandler(addReview)

)

reviewRouter.get('/get-reviews' , asyncHandler(getReviews))

reviewRouter.delete('/delete-review',
    isAuthenticated(),
    isAuthorized([roles.ADMIN, roles.CUSTOMER]),
    asyncHandler(deleteReview)
)

export default reviewRouter