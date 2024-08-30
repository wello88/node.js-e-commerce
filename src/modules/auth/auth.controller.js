import { User } from "../../../db/models/user.model.js"
import { AppError } from "../../utils/apperror.js"
import { comparePassword, hashPassword } from "../../utils/hashAndcompare.js"
import { messages } from "../../utils/constant/messages.js"
import { sendEmail } from "../../utils/email.js"
import { genrateToken, verifyToken } from "../../utils/token.js"
import { status } from "../../utils/constant/enums.js"
import { Cart } from "../../../db/index.js"
import { genrateOTP } from "../../utils/otp.js"
//sign up   
export const signup = async (req, res, next) => {
    let { userName, email, password, phone, DOB } = req.body

    //check exictance
    const userExist = await User.findOne({ $or: [{ phone }, { email }] })

    if (userExist) {

        return next(new AppError(messages.user.alreadyExist, 409))
    }
    // prepare Data
    password = hashPassword({ password })
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
    await Cart.create({ user: userVerify._id, products: [] })
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


export const forgetpassword = async (req, res, next) => {

    //get data from req
    const { email } = req.body
    //check existance

    const userExist = await User.findOne({ email })

    if (!userExist) {
        return next(new AppError(messages.user.notfound, 404))
    }
    //if already has email

    if (userExist.otp && userExist.otpExpiry > Date.now()) {
        return next(new AppError('user already has otp', 400))
    }

    //genrate otp

    const otp = genrateOTP()
    //update user otp
    userExist.otp = otp
    userExist.otpExpiry = Date.now() + 10 * 60 * 1000
    //save to db
    await userExist.save()
    //send email
    await sendEmail({
        to: email,
        subject: "change password",
        html: `<h1>u request 
        to change your password your otp is ${otp}\n
        verify</a>
        </h1>`})
    //send res
    return res.status(200).json({
        success: true,
        message: 'check your email'
    })
}


export const changePassword = async (req, res, next) => {
    //get data from req
    const { otp, newPassword, email } = req.body

    //check email
    const user = await User.findOne({ email })
    if (!user) {
        return next(new AppError(messages.user.notfound, 404))
    }
    if (user.otp != otp) {
        return next(new AppError('invalid otp', 400))

    }
    if (user.otpExpiry < Date.now()) {
        const secotp = genrateOTP()
        user.otpExpiry = Date.now() + 5 * 60 * 1000
        await user.save()
        sendEmail({
            to: email,
            subject: "resend otp",
            html: `<h1>u request 
            to change your password your otp is ${secotp}\n
            verify</a>
            </h1>`})
        return res.status(200).json({
            success: true,
            message: 'check your email'
        })
    }
    //hash new password
    const hashpass = hashPassword({ password: newPassword })

    // user.password = hashpass
    // user.otp = undefined
    // user.otpExpiry = undefined
    // await user.save()


    await User.updateOne({ email }, { password: hashpass, $unset: { otp:"", otpExpiry:"" }})


    return res.status(200).json({
        success: true,
        message: 'password changed successfully'
    })


}