import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { resetPassword } from "./user.controller.js";
import { asyncHandler } from "../../utils/apperror.js";

const userRouter = Router();


//reset password
userRouter.put('/reset-password',
    isAuthenticated(),
    asyncHandler(resetPassword)
)
export default userRouter