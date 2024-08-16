import { Router } from "express";
import { fileupload } from "../../utils/multer.js";
import { cloudupload } from "../../utils/multer.cloud.js";
import { isvalid } from "../../middleware/validation.js";
import { addCategoryval, deleteCategoryval, updateCategoryval } from "./category.validation.js";
import { addcategory, updateCategory, getSpecificCategory, deletCategory, CreateCategoryCloud, deleteCategoryCloud } from "./category.controller.js";
import { asyncHandler } from "../../utils/apperror.js";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "../../utils/constant/enums.js";

const categoryRouter = Router()



//add category 
categoryRouter.post('/add-category',
    asyncHandler(isAuthenticated()),
        isAuthorized([roles.ADMIN, roles.SELLER]),
    fileupload({ folder: 'category' }).single('image'),
    isvalid(addCategoryval),
    asyncHandler(addcategory)
)


categoryRouter.post('/add-category-cloud',
    isAuthenticated(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    cloudupload().single('image'),
    asyncHandler(CreateCategoryCloud)
)


//get category
categoryRouter.get('/get-category/:categoryId',
    asyncHandler(getSpecificCategory)
)



//update category 
categoryRouter.put('/update-category/:categoryId',
    asyncHandler(isAuthenticated()),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    fileupload({ folder: 'category' }).single('image'),
    isvalid(updateCategoryval),
    asyncHandler(updateCategory)

)



//delete category and it's subcategories
categoryRouter.delete('/delete-category/:categoryId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    isvalid(deleteCategoryval),
    asyncHandler(deletCategory)
)

categoryRouter.delete('/delete-category-cloud',
    isAuthenticated(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    asyncHandler(deleteCategoryCloud))


export default categoryRouter