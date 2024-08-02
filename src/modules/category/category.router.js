import { Router } from "express";
import { fileupload } from "../../utils/multer.js";
import { isvalid } from "../../middleware/validation.js";
import { addCategoryval, deleteCategoryval, updateCategoryval } from "./category.validation.js";
import { addcategory, updateCategory,getSpecificCategory, deleteCategory } from "./category.controller.js";
import { asyncHandler } from "../../utils/apperror.js";

const categoryRouter = Router()



//add category todo authentication and authorization
categoryRouter.post('/add-category',
    fileupload({ folder: 'category' }).single('image'),
    isvalid(addCategoryval),
    asyncHandler(addcategory)
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
    asyncHandler(deleteCategory))


    
export default categoryRouter