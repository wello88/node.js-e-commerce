import { Router } from "express";
import { fileupload } from "../../utils/multer.js";
import { isvalid } from "../../middleware/validation.js";
import { createBrandVal, updateBrandval } from "./brand.validation.js";
import { createBrand,deleteBrand,getBrand,updateBrand } from "./brand.controller.js";
import { asyncHandler } from "../../utils/apperror.js";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "../../utils/constant/enums.js";
import cloudinary from "../../utils/cloudinary.js";
import { cloudupload } from "../../utils/multer.cloud.js";


const brandRouter = Router()
//create brand
brandRouter.post('/',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SELLER]),
    // fileupload({ folder: 'brand' }).single('logo'),
    cloudupload({ folder: 'brand' }).single('logo'),
    isvalid(createBrandVal),
    asyncHandler(createBrand)
)
// get brand
brandRouter.get('/get-brand' , asyncHandler(getBrand))
//update brand 
brandRouter.put('/update-brand/:brandId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SELLER]),
    fileupload({ folder: 'brand' }).single('logo'),
    isvalid(updateBrandval),
    asyncHandler(updateBrand)
)

//delete brand 
brandRouter.delete('/delete-brand/:brandId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SELLER]),
    asyncHandler(deleteBrand)
)



export default brandRouter