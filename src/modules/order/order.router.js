import { Router } from "express";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "../../utils/constant/enums.js";
import { asyncHandler } from "../../utils/apperror.js";
import { 
    createOrder, 
    getOrders, 
    getOrderById, 
    cancelOrder,
    getAllOrders,
    updateOrderStatus,
    getOrderStats
} from "./order.controller.js";

const orderRouter = Router();

// User routes
orderRouter.post('/create-order',
    isAuthenticated(),
    asyncHandler(createOrder)
)

orderRouter.get('/my-orders',
    isAuthenticated(),
    asyncHandler(getOrders)
)

orderRouter.get('/my-orders/:orderId',
    isAuthenticated(),
    asyncHandler(getOrderById)
)

orderRouter.put('/cancel/:orderId',
    isAuthenticated(),
    asyncHandler(cancelOrder)
)

// Admin routes
orderRouter.get('/admin/all',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    asyncHandler(getAllOrders)
)

orderRouter.put('/admin/status/:orderId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    asyncHandler(updateOrderStatus)
)

orderRouter.get('/admin/stats',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    asyncHandler(getOrderStats)
)

export default orderRouter
