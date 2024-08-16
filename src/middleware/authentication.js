import { User } from "../../db/models/user.model.js"
import { AppError } from "../utils/apperror.js"
import { messages } from "../utils/constant/messages.js"
import { verifyToken } from "../utils/token.js"

export const isAuthenticated = ()=>{

    return async(req,res,next)=> {
        const {token} = req.headers

        if(!token){
            return next(new AppError("Token required",401))
        }
        let payload = null
        try {
            payload = verifyToken({token , secretKey: process.env.JWT_SECRET_KEY})
        } catch (error) {
            return next(new AppError(error.message,500))
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