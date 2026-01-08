import { Router } from "express";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "../../utils/constant/enums.js";
import { cloudupload } from "../../utils/multer.cloud.js";
import { asyncHandler } from "../../utils/apperror.js";
import { 
    AddUser, 
    deleteUser, 
    getAllUsers, 
    getSpecificUser, 
    updateUser,
    getDashboardStats 
} from "./admin.controller.js";

const adminRouter = Router();

// Dashboard stats
adminRouter.get('/dashboard-stats',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    asyncHandler(getDashboardStats)
)

// Add user
adminRouter.post('/add-user',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    cloudupload().single('image'),
    asyncHandler(AddUser)
)

// Get all users
adminRouter.get('/getUsers',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    asyncHandler(getAllUsers)
)

// Get specific user by id
adminRouter.get('/getSpecificUser/:userId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    asyncHandler(getSpecificUser)
)

// Update user
adminRouter.put('/update/:userId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    cloudupload().single('image'),
    asyncHandler(updateUser)
)

// Delete user
adminRouter.delete('/delete/:userId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    asyncHandler(deleteUser)
)

export default adminRouter
