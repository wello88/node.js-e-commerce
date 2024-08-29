import { User } from "../../../db/index.js"
import { AppError } from "../../utils/apperror.js"
import { messages } from "../../utils/constant/messages.js"
import { comparePassword, hashPassword } from "../../utils/hashAndcompare.js"

export const resetPassword = async (req, res, next) => {
    //get data  from req
    const { oldPassword, newPassword } = req.body
    const { userId } = req.authUser._id
    //check user old password
    const match = comparePassword({ password: oldPassword, hashPassword: req.authUser.password })
    if (!match){
        return next(new AppError(messages.user.invalidCreadintials, 401))
    }
    //update new password
    const hashpassword = hashPassword({password: newPassword})

    await User.updateOne({_id:userId},{password:hashpassword})

    return res.status(200).json({success:true,message:messages.user.updateSuccessfully})


}




