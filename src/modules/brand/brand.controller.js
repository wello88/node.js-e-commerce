import { Brand } from "../../../db/models/brand.model.js"
import { ApiFeature } from "../../utils/apiFeature.js"
import { AppError } from "../../utils/apperror.js"
import cloudinary from "../../utils/cloudinary.js"
import { messages } from "../../utils/constant/messages.js"
import { deleteFile } from "../../utils/file-functions.js"

export const createBrand = async (req, res, next) => {

    let { name,createdBy } = req.body
    name = name.toLowerCase()


    //check file
    if (!req.file) {
        return next(new AppError(messages.file.required, 400))
    }

    //check existance
    const brandExist = await Brand.findOne({ name })
    if (brandExist) {
        cloudinary.uploader.destroy(brandExist.logo.path)
        return next(new AppError(messages.Brand.alreadyExist, 409))
    }
    //prepare data 
    const slug = slugify(name)
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file?.path,
        {
            folder: 'e/brand'
        })
    const brand = new Brand({
        name,
        logo: {secure_url,public_id},
        createdBy: req.authUser._id
    })
    const createdbrand = await brand.save()
    if (!createdbrand) {
        deleteFile(brand.logo.path)
        return next(new AppError(messages.Brand.failtocreate, 500))
    }
    return res.status(201).json({
        success: true,
        message: messages.Brand.createSuccessfully,
        data: createdbrand,
        createdBy: createdbrand.createdBy

    })
}

// get brand 
export const getBrand = async (req, res, next) => {
    const apiFeature = new ApiFeature(Brand.find(), req.query).pagination().sort().select().filter()
    const brand = await apiFeature.mongooseQuery
    if (!brand) {
        return next(new AppError(messages.Brand.notfound.at, 404))
    }
    return res.status(200).json({
        success: true,
        data: brand
    })
}


export const updateBrand = async (req, res, next) => {
    //get data from req
    let { name } = req.body
    name = name.toLowerCase()
    const { brandId } = req.params
    //check existance
    const brandExist = await Brand.findById(brandId)
    if (!brandExist) {
        //remove logo
        if (req.file) {
            cloudinary.uploader.destroy(brandExist.logo.public_id)
        }
        return next(new AppError(messages.Brand.notfound.at, 404))
    }
    if (name) {
        const nameExist = await Brand.findOne({ name, _id: { $ne: brandId } })
        if (nameExist) {
            return next(new AppError(messages.Brand.alreadyExist, 409))
        }
        brandExist.name = name
    }
    if (req.file) {
        //remove old logo
        cloudinary.uploader.destroy(brandExist.logo.public_id)

        //save new logo
        brandExist.logo = await cloudinary.uploader.upload(req.file.path, {
            public_id: brandExist.logo.public_id
        })
    }
    const updatedbrand = await brandExist.save()
    if (!updatedbrand) {
        if (req.file) {
            cloudinary.uploader.destroy(brandExist.logo.public_id)
        }
        return next(new AppError(messages.Brand.failtoUpdate, 500))
    }
    return res.status(200).json({
        success: true,
        message: messages.Brand.updateSuccessfully,
        data: updatedbrand
    })

}



//delete brand
export const deleteBrand = async (req, res, next) => {

    const { brandId } = req.params
    const brandExist = await Brand.findById(brandId)
    if (!brandExist) {
        return next(new AppError(messages.Brand.notfound.at, 404))
    }
    //remove logo
    cloudinary.uploader.destroy(brandExist.logo.public_id)
    const deletedbrand = await brandExist.remove()
    if (!deletedbrand) {
        return next(new AppError(messages.Brand.failtoDelete, 500))
    }
    return res.status(200).json({
        success: true,
        message: messages.Brand.deleteSuccessfully
    })
}