import slugify from "slugify"
import { Brand } from "../../../db/models/brand.model.js"
import { Category } from "../../../db/models/category.model.js"
import { Subcategory } from "../../../db/models/subcategory.model.js"
import { Product } from "../../../db/models/product.model.js"
import { messages } from "../../utils/constant/messages.js"
import { ApiFeature } from "../../utils/apiFeature.js"
import { AppError } from "../../utils/apperror.js"

export const createProduct = async (req, res, next) => {
    //get data from request
    const { title, description, price, category, subcategory, brand, stock, discount, size, colors } = req.body
    //check category exist
    const categoryExist = await Category.findById(category)
    if (!categoryExist) {
        return next(new AppError(messages.category.notfound, 404))

    }
    //check subcategory exist
    const subcategoryExist = await Subcategory.findById(subcategory)
    if (!subcategoryExist) {
        return next(new AppError(messages.subcategory.notfound, 404))
    }
    //check existance brand
    const brandExist = await Brand.findById(brand)
    if (!brandExist) {
        return next(new AppError(messages.Brand.notfound, 404))

    }
    //prepare data
    const slug = slugify(title)

    // Upload mainImage to Cloudinary
    const mainImageUpload = await cloudinary.uploader.upload(req.files.mainImage[0].path);
    const mainImage = mainImageUpload.secure_url;

    // Upload subImages to Cloudinary and store their URLs in an array
    const subImages = await Promise.all(
        req.files.subImages.map(async (image) => {
            const uploadResult = await cloudinary.uploader.upload(image.path);
            return uploadResult.secure_url;
        })
    );

    const product = new Product({
        title,
        slug,
        mainImage,
        subImages,
        description,
        price,
        category,
        subcategory,
        brand,
        stock,
        discount,
        size: JSON.parse(size),
        colors: JSON.parse(colors),
        createdBy: req.authUser._id
    })

    const createdProduct = await product.save()
    if (!createdProduct) {
        return next(new AppError(messages.product.failtocreate, 500))
    }
    return res.status(201).json({
        message: messages.product.createSuccessfully,
        success: true,
        data: createdProduct
    })

}
// pagination ✅k and sorting ✅

export const getproduct = async (req, res, next) => {

    const apiFeature = new ApiFeature(Product.find(), req.query).pagination().sort().select().filter()

    const product = await apiFeature.mongooseQuery

    return res.status(200).json({
        message: messages.product.getsuccessfully,
        success: true,
        data: product
    })

}


//update product
export const updateProduct = async (req, res, next) => {
    const { title, description, price, category, subcategory, brand, stock, discount, size, colors } = req.body

    const { productId } = req.params

    const productExist = await Product.findById(productId)

    if (!productExist) {
        return next(new AppError(messages.product.notfound, 404))

    }

    const slug = slugify(title)


    const product = {
        title,
        slug,
        mainImage: req.files.mainImage[0].path,
        subImages: req.files.subImages.map((image) => image.path),
        description,
        price,
        category,
        subcategory,
        brand,
        stock,
        discount,
        size: JSON.parse(size),
        colors: JSON.parse(colors),
        createdBy: req.authUser._id
    }
    const updatedProduct = await Product.findByIdAndUpdate(productId, product, { new: true })

    if (!updatedProduct) {
        return next(new AppError(messages.product.failtoUpdate, 500))
    }

    return res.status(200).json({
        message: messages.product.updateSuccessfully,
        success: true,
        data: updatedProduct
    })

}



//delete product with images associated

export const deleteProduct = async (req, res, next) => {
    const { productId } = req.params

    const productExist = await Product.findById(productId)
    if (!productExist) {
        return next(new AppError(messages.product.notfound, 404))
    }

    //find and delete image

    deleteFile(productExist.mainImage.path)
    productExist.subImages.forEach((image) => {
        deleteFile(image.path)
    })
    await Product.findByIdAndDelete(productId)

    return res.status(200).json({
        message: messages.product.deleteSuccessfully,
        success: true
    })


}