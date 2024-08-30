import { Router } from "express"
import { fileupload } from "../../utils/multer.js"
import { isvalid } from "../../middleware/validation.js"
import { createProductVal } from "./product.validation.js"
import { asyncHandler } from "../../utils/apperror.js"
import { createProduct, deleteProduct, getproduct, updateProduct } from "./product.controller.js"
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js"
import { roles } from "../../utils/constant/enums.js"
import { cloudupload } from "../../utils/multer.cloud.js"
const productRouter = Router()

//create product 
productRouter.post('/add-product',
    isAuthenticated(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    cloudupload({ folder: 'product' }).fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 }

    ]),
    isvalid(createProductVal),
    asyncHandler(createProduct)
)

// update product
productRouter.put('/update-product/:productId',asyncHandler(updateProduct))

//delete product with images associated

productRouter.delete('/delete-product/:productId',asyncHandler(deleteProduct))


productRouter.get('/get-product',
    asyncHandler(getproduct))

export default productRouter