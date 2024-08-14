import { Router } from "express";
import { fileupload } from "../../utils/multer.js";
import { cloudupload } from "../../utils/multer.cloud.js";
import { isvalid } from "../../middleware/validation.js";
import { addCategoryval, deleteCategoryval, updateCategoryval } from "./category.validation.js";
import { addcategory, updateCategory,getSpecificCategory,deletCategory,CreateCategoryCloud, deleteCategoryCloud } from "./category.controller.js";
import { asyncHandler } from "../../utils/apperror.js";

const categoryRouter = Router()



//add category todo authentication and authorization
categoryRouter.post('/add-category',
    fileupload({ folder: 'category' }).single('image'),
    isvalid(addCategoryval),
    asyncHandler(addcategory)
)


categoryRouter.post('/add-category-cloud',
    cloudupload().single('image'),
    asyncHandler(CreateCategoryCloud)
)


//get category
categoryRouter.get('/get-category/:categoryId',
    asyncHandler(getSpecificCategory)
)



//update category 
//todo authentication and authorization
categoryRouter.put('/update-category/:categoryId',
    fileupload({ folder: 'category' }).single('image'),
    isvalid(updateCategoryval),
    asyncHandler(updateCategory)

)    



//delete category and it's subcategories
categoryRouter.delete('/delete-category/:categoryId',
    isvalid(deleteCategoryval),
    asyncHandler(deletCategory))

categoryRouter.delete('/delete-category-cloud',asyncHandler(deleteCategoryCloud))

    
export default categoryRouter