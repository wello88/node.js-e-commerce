import jwt from "jsonwebtoken"
import { AppError } from "./apperror.js"

export const genrateToken =  ({ payload={} ,secretKey = process.env.JWT_SECRET_KEY, expiresIn='1d' })=>{
return jwt.sign(payload,secretKey,{expiresIn})
}


export const verifyToken = ({token,secretKey= process.env.JWT_SECRET_KEY})=>{
try {
   return jwt.verify(token,secretKey)
} catch (error) {
    return next (new AppError(error.message,500))
}

}

