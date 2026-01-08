import { User } from "../../db/models/user.model.js"
import { AppError } from "../utils/apperror.js"
import { messages } from "../utils/constant/messages.js"
import { verifyToken } from "../utils/token.js"

export const isAuthenticated = ()=>{

    return async(req,res,next)=> {
        // Support both 'token' header and 'Authorization: Bearer <token>' header
        let token = req.headers.token;
        
        // If token is not in 'token' header, try Authorization Bearer header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // Remove 'Bearer ' prefix
            }
        }

        if(!token){
            return next(new AppError("Token required",401))
        }
        let payload = null
        try {
            payload = verifyToken({token , secretKey: process.env.JWT_SECRET_KEY})
        } catch (error) {
            // Provide more specific error messages
            if (error.name === 'JsonWebTokenError') {
                return next(new AppError("Invalid token",401))
            } else if (error.name === 'TokenExpiredError') {
                return next(new AppError("Token expired",401))
            } else if (error.name === 'JsonWebTokenError' && error.message.includes('signature')) {
                return next(new AppError("Invalid signature",401))
            }
            return next(new AppError(error.message,401))
        }
        // if(payload?._id){
        //     return next(new AppError("Invalid payload",401))
        // }
       const user = await User.findById(payload._id)
       if(!user){
        return next(new AppError(messages.user.notfound,401))
       }

       req.authUser = user
       next()
    }
}


export const isAuthorized = (roles=[])=>{

return async (req,res,next)=>{
    const user = req.authUser
    if(!roles.includes(user.role)){
        return next(new AppError('not authorized',401))
    }
    next()
}
}