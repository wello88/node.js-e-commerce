import slugify from "slugify"
import { Category } from "../../../db/models/category.model.js"
import { AppError } from "../../utils/apperror.js"
import { messages } from "../../utils/constant/messages.js"
import { deleteFile } from "../../utils/file-functions.js"
import { Subcategory } from "../../../db/models/subcategory.model.js"
import { Product } from "../../../db/models/product.model.js"
import cloudinary from "../../utils/cloudinary.js"
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


//create category using cloudinary to store images
export const CreateCategoryCloud = async (req, res, next) => {

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
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path,
        {
            folder: 'e/category'
            // public_id:category.image.public_id
        })
    const category = new Category({
        name,
        slug,
        image: { secure_url, public_id }
    })
    //add to database
    const createdCategory = await category.save()
    if (!createdCategory) {

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
export const deletCategory = async (req, res, next) => {
    // get data from req
    const { categoryId } = req.params

    // check category existance
    const categoryExist = await Category.findById(categoryId)
    if (!categoryExist) {
        return next(new AppError(messages.category.notfound, 404))
    }

    // prepare ids
    const subcategories = await Subcategory.find({ category: categoryId }).select("image")
    const products = await Product.find({ category: categoryId }).select(["mainImage", "subImages"])
    const subcategoriesIds = subcategories.map(sub => sub._id) // [id1 , id2 , id3]
    const productIds = products.map(product => product._id) // [id1 , id2 , id3]

    // delete subCategories
    await Subcategory.deleteMany({ _id: { $in: subcategoriesIds } });

    // delete products
    await Product.deleteMany({ _id: { $in: productIds } });

    // Delete images of subcategories
    subcategories.forEach(subcategory => {
        deleteFile(subcategory.image.path);
    });

    // Delete images of products
    products.forEach(product => {
        deleteFile(product.mainImage);
        product.subImages.forEach(image => {
            deleteFile(image);
        });
    });

    // delete category
    const deletedCategory = await Category.deleteOne({ _id: categoryId })
    if (!deletedCategory) {
        return next(new AppError(messages.category.failtoDelete, 500))
    }
    // delete category image
    deleteFile(categoryExist.image.path)

    return res.status(200).json({ message: messages.category.deleteSuccessfully, success: true })
}




//delete category and it's subcategories from cloud
export const deleteCategoryCloud = async (req, res, next) => {

    const { categoryId } = req.query
    //check category existance
    const categoryExist = await Category.findByIdAndDelete(categoryId)
    if (!categoryExist) {
        return next(new AppError(messages.category.notfound, 404))
    }


    //prepare ids
    const subcategories = await Subcategory.find({ category: categoryId }).select("image")
    const products = await Product.find({ category: categoryId }).select(["mainImage", "subImages"])
    const subcategoriesIds = []
    const imagePaths = []
    subcategories.forEach(sub => {
        imagePaths.push(sub.image)
        subcategoriesIds.push(sub._id);
    }) // [id1 , id2 , id3]

    const productIds = []
    products.forEach(product => {
        imagePaths.push(product.mainImage)
        imagePaths.push(...product.subImages)
        productIds.push(product._id)
    }) // [id1 , id2 , id3]


    //delete subcategory

    await Subcategory.deleteMany({ _id: { $in: subcategoriesIds } });
    await Product.deleteMany({ _id: { $in: productIds } });
    // Delete images of subcategories
    for (let i = 0; i < imagePaths.length; i++) {
        console.log(imagePaths)
        if (typeof (imagePaths[i]) == "string") {
            deleteFile(imagePaths[i])
        }
        else {
            
            await cloudinary.uploader.destroy(imagePaths[i].public_id)
        }
        
    }
    console.log(categoryId)
    // //another sol
    // await cloudinary.api.delete_resources_by_prefix(`e/category/${categoryId}`);
    // await cloudinary.api.delete_folder(`e/category/${categoryId}`);
    // Send response
    res.status(200).json({ message: 'Category and related resources deleted successfully' });
}




export const updateCategoryCloud = async (req, res, next) => {
    const { categoryId } = req.query
    const category = await Category.findById(categoryId)

    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { public_id: category.image.public_id })
        req.body.image = { secure_url, public_id }
    }
    category.image = req.body.image|| category.image
    category.name = req.body.name || category.name
   await category.save()
}