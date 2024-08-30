import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { deleteUser, getUserData, resetPassword, updateUser } from "./user.controller.js";
import { asyncHandler } from "../../utils/apperror.js";

const userRouter = Router();


//reset password
userRouter.put('/reset-password',
    isAuthenticated(),
    asyncHandler(resetPassword))
//get user data 
userRouter.get('/get-data',
    isAuthenticated(),
    asyncHandler(getUserData)
)    

//update user data 
userRouter.put ('/update-data',
    isAuthenticated(),
    asyncHandler(updateUser)
)

//delete user 
userRouter.delete('/delete-user',
    isAuthenticated(),
    asyncHandler(deleteUser)
)
export default userRouter