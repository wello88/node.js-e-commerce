import { Router } from "express";
import { fileupload } from "../../utils/multer.js";
import { get_sub_catVal, subCategoryVal } from "./subCategory.validation.js";
import { isvalid } from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/apperror.js";
import { addsubcategory ,deletesubcategory,getAllsubcategory,getsubcategory, updateSubCategory} from "./subCategory.controller.js";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "../../utils/constant/enums.js";
import { cloudupload } from "../../utils/multer.cloud.js";

const subCategoryRouter = Router()

//create subcategory
subCategoryRouter.post('/add-sub-category',
    isAuthenticated(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    cloudupload({ folder: 'subcategory' }).single('image'),
    // fileupload({ folder: 'subcategory' }).single('image'),
    isvalid(subCategoryVal),
    asyncHandler(addsubcategory))

//update subcategory
subCategoryRouter.put('/update-sub-category/:subCategoryId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    cloudupload({ folder: 'subcategory' }).single('image'),
    asyncHandler(updateSubCategory))

//get specific sub-category
subCategoryRouter.get('/get-sub-category/:categoryId',
    isvalid(get_sub_catVal),
    asyncHandler(getsubcategory))


//get all sub-categories
subCategoryRouter.get('/get-all-sub-category',
    isAuthenticated(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    asyncHandler(getAllsubcategory))


//delete sub-category
subCategoryRouter.delete('/delete-sub-category/:subCategoryId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN, roles.SELLER]),

    asyncHandler(deletesubcategory)
)    

export default subCategoryRouter