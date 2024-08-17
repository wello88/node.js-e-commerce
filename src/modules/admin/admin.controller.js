import { User } from "../../../db/models/user.model.js"
import { AppError } from "../../utils/apperror.js"
import cloudinary from "../../utils/cloudinary.js"
import { roles, status } from "../../utils/constant/enums.js"
import { messages } from "../../utils/constant/messages.js"
import { hashPassword } from "../../utils/hashAndcompare.js"

// add user 
export const AddUser = async (req, res, next) => {

    //get data from req
    const { userName, email, phone, role } = req.body
    // check exictance
    const userExist = await User.findOne({ $or: [{ phone }, { email }] })

    if (userExist) {
        return next(new AppError(messages.user.alreadyExist, 409))
    }
    //upload image
    if(req.file){
        const {secure_url,public_id}= await cloudinary.uploader.upload(req.file.path,{folder:"e/users"})
        req.body.image = {secure_url,public_id}
    }
    const hashedpassword = hashPassword({password:'123'})
    const createdUser = await User.create({
        userName,
        email,
        phone,
        role,   
        password:hashedpassword,
        status:status.VERIFIED,
        image:req.body.image

    })
    if (!createdUser) {
        return next(new AppError(messages.user.failtocreate, 500))
    }

    return res.status(201).json({
        message: messages.user.createSuccessfully,
        success: true,
        data: createdUser
    })

}


//get all users
export const getAllUsers = async (req, res, next) => {

    const users = await User.find()
    if (!users) {
        return next(new AppError(messages.user.notfound, 404))
    }

    return res.status(200).json({
        message: messages.user.getsuccessfully,
        success: true,
        data: users
    })
}



//get specific user
export const getSpecificUser = async (req, res, next) => {

    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) {
        return next(new AppError(messages.user.notfound, 404))
    }

    return res.status(200).json({
        message: messages.user.getsuccessfully,
        success: true,
        data: user
    })
}

//update user
export const updateUser = async (req, res, next) => {

    //getdaata
    const { userName, email, phone, role } = req.body
    const { userId } = req.params

    //check existance
    const userExist = await User.findById(userId)
    if(!userExist){
        return next(new AppError(messages.user.notfound, 404))
    }
    //update image
    if(req.file){
        const {secure_url,public_id}= await cloudinary.uploader.upload(req.file.path,{folder:"e/users"})
        req.body.image = {secure_url,public_id}
    }

    //update data
    req.body.updatedBy = req.authUser._id
    
    const updatedUser = await User.findByIdAndUpdate(userId, { userName, email, phone, role ,image:req.body.image}, { new: true })
    if (!updatedUser) {
        return next(new AppError(messages.user.failtoUpdate, 500))
    }
    return res.status(200).json({
        message: messages.user.updateSuccessfully,  
        success: true,
        data: updatedUser
    })


}



//delete user
export const deleteUser = async (req, res, next) => {

    const { userId } = req.params
    const userExist = await User.findById(userId)
     if (!userExist) {
        return next(new AppError(messages.user.notfound, 404))
    }
    //if role is admin don't delete user
    if(userExist.role === roles.ADMIN){        
        return next(new AppError('can not delete this user as role is admin', 400))
    }
    else{   
        const deletedUser = await User.findByIdAndDelete(userId)
        if (!deletedUser) {
            return next(new AppError(messages.user.failtoDelete, 500))
        }
    }
   

    return res.status(200).json({
        message: messages.user.deleteSuccessfully,
        success: true
    })
}