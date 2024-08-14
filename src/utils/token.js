import jwt from "jsonwebtoken"

export const genrateToken =  ({ payload={} ,secretKey = process.env.JWT_SECRET_KEY, expiresIn='1d' })=>{
return jwt.sign(payload,secretKey,{expiresIn})
}


export const verifyToken = ({token,secretKey})=>{
    return jwt.verify(token,secretKey)
}

