import { connectDB } from "../db/connection.js"
// import adminRouter from "./modules/admin/admin.router.js"
// import authRouter from "./modules/auth/auth.router.js"
// import brandRouter from "./modules/brand/brand.router.js"
// import categoryRouter from "./modules/category/category.router.js"
// import productRouter from "./modules/product/product.router.js"
// import reviewRouter from "./modules/review/review.router.js"
// import subCategoryRouter from "./modules/subCategory/subCategory.router.js"
// import wishlistRouter from "./modules/wishlist/wishlist.router.js"

import * as allRouters from'./index.js' 
import { globalErrorHandler } from "./utils/apperror.js"

export const bootStrap = (app, express) => {
    app.use('/uploads', express.static('uploads'))
    app.use(express.json())
    connectDB()
    const port = 3000
    app.get("/", (req, res) => res.send("Hello World!"))
    app.listen(port, () => console.log(`app listening on port ${port}!`))
    app.use('/category', allRouters.categoryRouter)
    app.use('/sub-category',allRouters. subCategoryRouter)
    app.use('/brand',allRouters.brandRouter)
    app.use('/product',allRouters.productRouter)
    app.use('/auth',allRouters.authRouter)
    app.use('/admin',allRouters.adminRouter)
    app.use('/wishlist',allRouters.wishlistRouter)
    app.use('/review',allRouters.reviewRouter)
    app.use('/coupon',allRouters.couponRouter)
    app.use(globalErrorHandler)
}