import { User } from "../../../db/models/user.model.js"
import { AppError } from "../../utils/apperror.js"
import { comparePassword, hashPassword } from "../../utils/hashAndcompare.js"
import { messages } from "../../utils/constant/messages.js"
import { sendEmail } from "../../utils/email.js"
import { genrateToken, verifyToken } from "../../utils/token.js"
import { status } from "../../utils/constant/enums.js"
//sign up
export const signup = async (req, res, next) => {
    let { userName, email, password, phone, DOB, } = req.body

    //check exictance
    const userExist = await User.findOne({ $or: [{ phone }, { email }] })

    if (userExist) {

        return next(new AppError(messages.user.alreadyExist, 409))
    }
    // prepare Data
    // password = hashPassword({ password })
    const user = new User({
        userName,
        email,
        phone,
        password,
    })

    const createduser = await user.save()
    if (!createduser) {
        return next(new AppError(messages.user.failtocreate, 500))
    }

    //send email

    const token = genrateToken({ payload: { _id: createduser._id } })

    await sendEmail({
        to: email,
        subject: "verify account",
        html: `<p>
        to verify your accpunt click here 
        <a href="${req.protocol}://${req.headers.host}/auth/verify?token=${token}">
        verify</a>
        </p>`})
    return res.status(201).json({
        message: messages.user.createSuccessfully,
        data: createduser,
        success: true
    })

}

// verify account
export const verifyAccount = async (req, res, next) => {

    //get data from req
    const { token } = req.query
    const decoded = verifyToken({ token, secretKey: process.env.JWT_SECRET_KEY })

    const userVerify = await User.findByIdAndUpdate(decoded._id, { status: status.VERIFIED }, { new: true })
    if (!userVerify) {
        return next(new AppError(messages.user.notfound, 404))
    }
    return res.status(200).json({
        messages: messages.user.verified,
        // data: userVerify,
        success: true
    })

}


//login 
export const login = async (req, res, next) => {
    //get data from req
    const { email, password, phone } = req.body

 

    const userExist = await User.findOne({ $or: [{ email }, { phone }] })

    if (!userExist) {
        return next(new AppError(messages.user.notfound, 404))
    }  

    if (!userExist.status === status.VERIFIED) {
        return next(new AppError(messages.user.notverified, 401))
    }

    //check password
    const match = comparePassword(password, userExist.password)

    if (!match) {
        return next(new AppError(messages.user.invalidCreadintials, 401))
    }
    userExist.isActive = true

    await userExist.save()

    const accessToken = genrateToken({ payload: { _id: userExist._id } })
    return res.status(200).json({
        success: true,
        accessToken,
        message: messages.user.loginSuccessfully

    })
}