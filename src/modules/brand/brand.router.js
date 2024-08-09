import { Router } from "express";
import { fileupload } from "../../utils/multer.js";
import { isvalid } from "../../middleware/validation.js";
import { createBrandVal, updateBrandval } from "./brand.validation.js";
import { createBrand,deleteBrand,getBrand,updateBrand } from "./brand.controller.js";
import { asyncHandler } from "../../utils/apperror.js";


const brandRouter = Router()
//create brand //todo is authentication

brandRouter.post('/',
    fileupload({ folder: 'brand' }).single('logo'),
    isvalid(createBrandVal),
    asyncHandler(createBrand)
)
brandRouter.get('/get-brand' , asyncHandler(getBrand))
//update brand //todo auth
brandRouter.put('/update-brand/:brandId',
    fileupload({ folder: 'brand' }).single('logo'),
    isvalid(updateBrandval),
    asyncHandler(updateBrand)
)

//delete brand todo authentication and authorization
brandRouter.delete('/delete-brand/:brandId',asyncHandler(deleteBrand))



export default brandRouter