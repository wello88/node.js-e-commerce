import slugify from "slugify"
import { Category } from "../../../db/models/category.model.js"
import { AppError } from "../../utils/apperror.js"
import { messages } from "../../utils/constant/messages.js"
import { deleteFile } from "../../utils/file-functions.js"
import { Subcategory } from "../../../db/models/subcategory.model.js"
// import axios from "axios"


//CREATE CATEGORY
export const addcategory = async (req, res, next) => {

    //get data from request
    const { name } = req.body
    //check file
    if (!req.file) {
        return new AppError(messages.file.required, 400)
    }
    //check existance
    const categoryExist = await Category.findOne({ name: name.toLowerCase() })
    if (categoryExist) {
        return next(new AppError(messages.category.alreadyExist, 409))
    }
    //prepare data
    const slug = slugify(name)
    const category = new Category({
        name,
        slug,
        image: { path: req.file.path }
    })
    //add to database
    const createdCategory = await category.save()
    if (!createdCategory) {
        deleteFile(createdCategory.image.path)
        return next(new AppError(messages.category.failtocreate, 500))
    }
    //send res
    return res.status(201).json({
        message: messages.category.createSuccessfully,
        success: true,
        data: createdCategory
    })

}



//GET SPECIFIC CATEGORY
export const getSpecificCategory = async (req, res, next) => {
    //GET DATA FROM REQ 
    const { categoryId } = req.params

    const category = await Category.findById(categoryId).populate([{ path: 'subcategory' }])
    category ?
        res.status(200).json({ data: category, success: true })
        : next(new AppError(messages.category.notfound, 404))

    // axios({
    //     method:'get',
    //     url:`${req.protocol}://${req.headers.host}/sub-category/${req.params.categoryId}`
    // }).then((response)=>{
    //     res.status(response.status).json({response:response.data,success:true})
    // }).catch(err => {return next(new AppError(err.message,500))})

}



//UPDATE CATEGORY
export const updateCategory = async (req, res, next) => {
    //getdaata
    const { name } = req.body
    const { categoryId } = req.params

    //check existance
    const categoryExist = await Category.findById(categoryId)
    if (!categoryExist) {
        return next(new AppError(messages.category.notfound, 404))
    }
    //check name existance
    const nameExist = await Category.findOne({ name, _id: { $ne: categoryId } })
    if (nameExist) {
        return next(new AppError(messages.category.alreadyExist, 409))
    }
    //prepare data
    if (name) {
        categoryExist.slug = slugify(name)
    }
    //UPDATE IMAGE   
    if (req.file) {
        //delete old image
        deleteFile(categoryExist.image.path)
        //add new image

        categoryExist.image.path = req.file.path
    }
    //save to db
    const updatedCategory = await categoryExist.save()
    if (!updatedCategory) {
        return next(new AppError(messages.category.failtoUpdate, 500))
    }
    //send res
    return res.status(200).json({
        message: messages.category.updateSuccessfully,
        success: true,
        data: updatedCategory
    })

}



//delete category and it's subcategories
export const deleteCategory = async (req, res, next) => {

    const { categoryId } = req.params
    const categoryExist = await Category.findByIdAndDelete(categoryId)

    if (!categoryExist) {
        return next(new AppError(messages.category.notfound, 404))

    }
    deleteFile(categoryExist.image.path)
    //find and delete all subcategories attached to this category
    const subcategories = await Subcategory.find({ category: categoryId })
    // Delete each subcategory image file if it exists and delete the subcategory
    for (const subcategory of subcategories) {
        if (subcategory.image && subcategory.image.path) {
            deleteFile(subcategory.image.path);
        }
        await Subcategory.findByIdAndDelete(subcategory._id);
    }
    //res
    return res.status(200).json({ message: messages.category.deleteSuccessfully, success: true })


}   