import { User } from "../../../db/index.js"
import { AppError } from "../../utils/apperror.js"
import cloudinary from "../../utils/cloudinary.js"
import { status } from "../../utils/constant/enums.js"
import { messages } from "../../utils/constant/messages.js"
import { sendEmail } from "../../utils/email.js"
import { comparePassword, hashPassword } from "../../utils/hashAndcompare.js"
import { genrateToken } from "../../utils/token.js"

//reset password
export const resetPassword = async (req, res, next) => {
    // get data from req
    const { oldPassword, newPassword } = req.body
    const userId = req.authUser._id
    // check user password
    const match = comparePassword({ password: oldPassword, hashPassword: req.authUser.password })
    if (!match) {
        return next(new AppError(messages.user.invalidCreadintials, 401))
    }
    // hash new password
    const hashedPassword = hashPassword({ password: newPassword })

    // update password
    await User.updateOne({ _id: userId }, { password: hashedPassword })

    // send res
    return res.status(200).json({ message: messages.user.updateSuccessfully, success: true })
}



//get user
export const getUserData = async (req, res, next) => {
    const userId = req.authUser._id
    const user = await User.findById(userId)
    if (!user) {
        return next(new AppError(messages.user.notfound, 404))
    }
    return res.status(200).json({ success: true, data: user })
}


//update user
export const updateUser = async (req, res, next) => {
    // get data 
    const userId = req.authUser._id
    const { userName, email, phone, address } = req.body
    // check user exist
    const user = await User.findById(userId)
    if (!user) {
        return next(new AppError(messages.user.notfound, 404))
    }

    if (req.file) {
        if (user.image && user.image.public_id !== process.env.PUBLIC_ID) {
            await cloudinary.uploader.destroy(user.image.public_id);
        }
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: 'e/user',
        });

        // Update the user's image with the new details
        req.body.image = { secure_url, public_id };
    }

    // update email
    if (email) {
        // check if email already exist in another user
        const userExist = await User.findOne({ email })
        // if email exist and its not my current email
        if (userExist && email != user.email) {
            return next(new AppError("email is already in use", 409))
        }
        if (userExist && email == user.email) {
            user.email = email
        }
        else {
            user.email = email
            user.status = status.PENDING
            user.isActive = false
            const token = genrateToken({ payload: { _id: user._id } })
            await sendEmail({
                to: email, subject: 'verify account', html: `<p>to verify your account please click 
            <a href="${req.protocol}://${req.headers.host}/auth/verify?token=${token}"> verify account </a>
          </p>`
            })
        }
    }
    user.userName = userName || user.userName
    user.phone = phone || user.phone
    if (address) {
        user.address = JSON.parse(address) || user.address
    }
    user.image = req.body.image || user.image
    const updatedUser = await user.save()
    if (!updatedUser) {
        return next(new AppError(messages.user.failtoUpdate, 500))
    }
    return res.status(200).json({ message: messages.user.updateSuccessfully, success: true, data: updatedUser })

}






// Delete user
export const deleteUser = async (req, res, next) => {
    const userId = req.authUser._id;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
        return next(new AppError(messages.user.notfound, 404));
    }

    // Remove the user's image from Cloudinary if it exists
    if (user.image && user.image.public_id) {
        await cloudinary.uploader.destroy(user.image.public_id);
    }

    // Delete the user from the database
    await User.findByIdAndDelete(userId);

    // Respond with success
    return res.status(200).json({
        message: messages.user.deleteSuccessfully,
        success: true
    });
};