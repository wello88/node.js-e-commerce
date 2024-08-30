import slugify from "slugify"
import { Category } from "../../../db/models/category.model.js"
import { Subcategory } from "../../../db/models/subcategory.model.js"
import { AppError } from "../../utils/apperror.js"
import { messages } from "../../utils/constant/messages.js"
import { deleteFile } from "../../utils/file-functions.js"
import { ApiFeature } from "../../utils/apiFeature.js"
import cloudinary from "../../utils/cloudinary.js"

//CREATE SUBCATEGORY
export const addsubcategory = async (req, res, next) => {
    //get data from request
    let { name, category } = req.body
    name = name.toLowerCase()
    //check file
    if(!req.file){
        return next(new AppError(messages.file.required,400))
    }
    //check existance of category
    const categoryExist = await Category.findById(category)
    if (!categoryExist) {
        return next(new AppError(messages.category.notfound,404))
    }
    //check existance of subcategory
    const subcategoryExist = await Subcategory.findOne({name})
    
    if(subcategoryExist){
        return next(new AppError(messages.subcategory.alreadyExist,409))
    }
    
    //prepare data
    const slug = slugify(name)
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file?.path,{
        folder:'e/subcategory'
    })
    const subcategory = new Subcategory({
        name,
        slug,
        category,
        image:{secure_url,public_id},
    })
    //add to db
    const subCategoryCreated = await subcategory.save()
    if(!subCategoryCreated){
        cloudinary.uploader.destroy(subcategory.image.public_id)
        return next(new AppError(messages.subcategory.failtocreate,500))
    }
    //response
    return res.status(201).json({
        message:messages.subcategory.createSuccessfully,
        success:true,
        data:subCategoryCreated
    })


}




//update subcategory

export const updateSubCategory = async (req, res, next) => {

    const { name, category } = req.body
    const { subCategoryId } = req.params
    //check existance
    const subcategoryExist = await Subcategory.findByIdAndUpdate(subCategoryId, { name, category }, { new: true })
    if (!subcategoryExist) {
        return next(new AppError(messages.subcategory.notfound,404))
    }
    return res.status(200).json({
        message:messages.subcategory.updateSuccessfully,
        success:true,
        data:subcategoryExist
    })
}

//GET SUBCATEGORY

export const getsubcategory = async (req, res, next) => {

    const {categoryId } = req.params

    //check existance
    const categoryExist = await Category.findById(categoryId)
    if(!categoryExist){
        return next(new AppError(messages.category.notfound,404))

    }
    const subcategory = await Subcategory.find({category:categoryId}).populate([{path:'category'}])

    if(!subcategory){
        return next(new AppError(messages.subcategory.notfound,404))

    }
    return res.status(200).json({
        message:messages.subcategory.getsuccessfully,
        success:true,
        data:subcategory
    })


}



//get all sub-category and appli api feture
export const getAllsubcategory = async (req, res, next) => {
    const apiFeature = new ApiFeature(Subcategory.find(),req.query).pagination().sort().select().filter()

    const subcategory = await apiFeature.mongooseQuery

    if(!subcategory){
        return next(new AppError(messages.subcategory.notfound,404))

    }

    return res.status(200).json({
        message:messages.subcategory.getsuccessfully,
        success:true,
        data:subcategory
    })
}


//delete sub-category
export const deletesubcategory = async (req, res, next) => {
    const { subCategoryId } = req.params    
    //check existance   
    const subcategoryExist = await Subcategory.findByIdAndDelete(subCategoryId)
    if(!subcategoryExist){
        return next(new AppError(messages.subcategory.notfound,404))
    }

         // Check if image and image.path exist before deleting
        if (subcategoryExist.image && subcategoryExist.image.path) {
            cloudinary.uploader.destroy(subcategoryExist.image.secure_url);
        } else {
            return next(new AppError('file not found',404))
        }

    return res.status(200).json({
        message:messages.subcategory.deleteSuccessfully,
        success:true
    })
}