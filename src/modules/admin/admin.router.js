import { Router } from "express";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "../../utils/constant/enums.js";
import { cloudupload} from "../../utils/multer.cloud.js";
import { asyncHandler } from "../../utils/apperror.js";
import { AddUser, deleteUser, getAllUsers, getSpecificUser, updateUser } from "./admin.controller.js";

const adminRouter = Router();

//add user
adminRouter.post('/add-user',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    cloudupload().single('image'),
    // isvalid(),
        AddUser
    

)



//get user
adminRouter.get('/getUsers',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    asyncHandler(getAllUsers)

)



//get specific user by id
adminRouter.get('/getSpecificUser/:userId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    asyncHandler(getSpecificUser)
)



//update user
adminRouter.put('/update/:userId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    cloudupload().single('image'),
    asyncHandler(updateUser)
)



//delete user via admin
adminRouter.delete('/delete/:userId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    asyncHandler(deleteUser)
)

export default adminRouter