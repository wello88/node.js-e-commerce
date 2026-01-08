import slugify from "slugify"
import { Brand } from "../../../db/models/brand.model.js"
import { Category } from "../../../db/models/category.model.js"
import { Subcategory } from "../../../db/models/subcategory.model.js"
import { Product } from "../../../db/models/product.model.js"
import { messages } from "../../utils/constant/messages.js"
import { ApiFeature } from "../../utils/apiFeature.js"
import { AppError } from "../../utils/apperror.js"
import cloudinary from "../../utils/cloudinary.js"

// Helper function to localize product data
const localizeProduct = (product, lang) => {
    if (!product) return product
    const productObj = product.toObject ? product.toObject() : { ...product }
    
    if (lang === 'ar') {
        productObj.title = productObj.titleAr || productObj.title
        productObj.description = productObj.descriptionAr || productObj.description
        if (productObj.category && typeof productObj.category === 'object') {
            productObj.category.name = productObj.category.nameAr || productObj.category.name
        }
    }
    return productObj
}

export const createProduct = async (req, res, next) => {
    //get data from request
    const { title, titleAr, description, descriptionAr, price, category, subcategory, brand, stock, discount, size, colors } = req.body
    //check category exist
    const categoryExist = await Category.findById(category)
    if (!categoryExist) {
        return next(new AppError(messages.category.notfound, 404))
    }
    //check subcategory exist (optional)
    if (subcategory) {
        const subcategoryExist = await Subcategory.findById(subcategory)
        if (!subcategoryExist) {
            return next(new AppError(messages.subcategory.notfound, 404))
        }
    }
    //check brand exist (optional)
    if (brand) {
        const brandExist = await Brand.findById(brand)
        if (!brandExist) {
            return next(new AppError(messages.Brand.notfound, 404))
        }
    }
    //prepare data
    const slug = slugify(title)

    // Upload mainImage to Cloudinary
    if (!req.files || !req.files.mainImage || !req.files.mainImage[0]) {
        return next(new AppError('Main image is required', 400))
    }
    
    const mainImageUpload = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
        folder: 'e/product'
    });
    const mainImage = mainImageUpload.secure_url;

    // Upload subImages to Cloudinary (optional)
    let subImages = [];
    if (req.files.subImages && req.files.subImages.length > 0) {
        subImages = await Promise.all(
            req.files.subImages.map(async (image) => {
                const uploadResult = await cloudinary.uploader.upload(image.path, {
                    folder: 'e/product'
                });
                return uploadResult.secure_url;
            })
        );
    }

    const product = new Product({
        title,
        titleAr,
        slug,
        mainImage,
        subImages,
        description,
        descriptionAr,
        price,
        category,
        ...(subcategory && { subcategory }),
        ...(brand && { brand }),
        stock,
        discount,
        size: size ? JSON.parse(size) : [],
        colors: colors ? JSON.parse(colors) : [],
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
    const { lang } = req.query // 'en' or 'ar'

    const apiFeature = new ApiFeature(
        Product.find().populate('category', 'name nameAr').populate('subcategory', 'name').populate('brand', 'name'),
        req.query
    ).pagination().sort().select().filter()

    const products = await apiFeature.mongooseQuery.exec()
    
    // Localize products if language specified
    const localizedProducts = products.map(product => localizeProduct(product, lang))

    return res.status(200).json({
        message: messages.product.getsuccessfully,
        success: true,
        data: localizedProducts
    })

}

// get single product by ID
export const getProductById = async (req, res, next) => {
    const { productId } = req.params
    const { lang } = req.query // 'en' or 'ar'

    const product = await Product.findById(productId)
        .populate('category', 'name nameAr')
        .populate('subcategory', 'name')
        .populate('brand', 'name')

    if (!product) {
        return next(new AppError(messages.product.notfound, 404))
    }

    // Localize product if language specified
    const localizedProduct = localizeProduct(product, lang)

    return res.status(200).json({
        message: messages.product.getsuccessfully,
        success: true,
        data: localizedProduct
    })
}


//update product
export const updateProduct = async (req, res, next) => {
    const { title, titleAr, description, descriptionAr, price, category, subcategory, brand, stock, discount, size, colors } = req.body

    const { productId } = req.params

    const productExist = await Product.findById(productId)

    if (!productExist) {
        return next(new AppError(messages.product.notfound, 404))

    }

    const slug = title ? slugify(title) : productExist.slug
    
    // Prepare product update object
    const product = {
        ...(title && { title }),
        ...(titleAr !== undefined && { titleAr }),
        ...(slug && { slug }),
        ...(description && { description }),
        ...(descriptionAr !== undefined && { descriptionAr }),
        ...(price && { price }),
        ...(category && { category }),
        ...(subcategory && { subcategory }),
        ...(brand && { brand }),
        ...(stock !== undefined && { stock }),
        ...(discount !== undefined && { discount }),
        ...(size && { size: typeof size === 'string' ? JSON.parse(size) : size }),
        ...(colors && { colors: typeof colors === 'string' ? JSON.parse(colors) : colors }),
        updatedBY: req.authUser._id
    }

    // Handle image uploads if provided
    if (req.files) {
        if (req.files.mainImage && req.files.mainImage[0]) {
            const mainImageUpload = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
                folder: 'e/product'
            });
            product.mainImage = mainImageUpload.secure_url;
        }
        
        if (req.files.subImages && req.files.subImages.length > 0) {
            const subImages = await Promise.all(
                req.files.subImages.map(async (image) => {
                    const uploadResult = await cloudinary.uploader.upload(image.path, {
                        folder: 'e/product'
                    });
                    return uploadResult.secure_url;
                })
            );
            product.subImages = subImages;
        }
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
    const { productId } = req.params;
  
    // Check if the product exists
    const productExist = await Product.findById(productId);
    if (!productExist) {
      return next(new AppError(messages.product.notfound, 404));
    }
  
    // Delete the main image from Cloudinary
    if (productExist.mainImage) {
      // Extract the public ID from the Cloudinary URL
      const mainImagePublicId = `e/product/${productExist.mainImage.split('/').pop().split('.')[0]}`;
      await cloudinary.uploader.destroy(mainImagePublicId);
    }
  
    // Delete each sub-image from Cloudinary
    if (productExist.subImages && productExist.subImages.length > 0) {
      await Promise.all(
        productExist.subImages.map(async (image) => {
          // Extract the public ID from the Cloudinary URL
          const subImagePublicId = `e/product/${image.split('/').pop().split('.')[0]}`;
          await cloudinary.uploader.destroy(subImagePublicId);
        })
      );
    }
  
    
    // Delete the product from the database
    await Product.findByIdAndDelete(productId);
  
    return res.status(200).json({
      message: messages.product.deleteSuccessfully,
      success: true,
    });
  };