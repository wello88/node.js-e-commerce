import { Router } from "express";
import { isvalid } from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/apperror.js";
import { changePassword, forgetpassword, login, signup,verifyAccount } from "./auth.controller.js";
import { loginval } from "./auth.validation.js";

const authRouter = Router();

//signup
authRouter.post('/signup',asyncHandler(signup))
authRouter.get('/verify',asyncHandler(verifyAccount))
authRouter.post('/login',isvalid(loginval),asyncHandler(login))
authRouter.post('/forget-password',asyncHandler(forgetpassword))
authRouter.put('/change-password',asyncHandler(changePassword))
export default authRouter