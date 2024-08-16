import { connectDB } from "../db/connection.js"
import adminRouter from "./modules/admin/admin.router.js"
import authRouter from "./modules/auth/auth.router.js"
import brandRouter from "./modules/brand/brand.router.js"
import categoryRouter from "./modules/category/category.router.js"
import productRouter from "./modules/product/product.router.js"
import subCategoryRouter from "./modules/subCategory/subCategory.router.js"
import wishlistRouter from "./modules/wishlist/wishlist.router.js"
import { globalErrorHandler } from "./utils/apperror.js"

export const bootStrap = (app, express) => {
    app.use('/uploads', express.static('uploads'))
    app.use(express.json())
    connectDB()
    const port = 3000
    app.get("/", (req, res) => res.send("Hello World!"))
    app.listen(port, () => console.log(`app listening on port ${port}!`))
    app.use('/category', categoryRouter)
    app.use('/sub-category', subCategoryRouter)
    app.use('/brand',brandRouter)
    app.use('/product',productRouter)
    app.use('/auth',authRouter)
    app.use('/admin',adminRouter)
    app.use('/wishlist',wishlistRouter)
    app.use(globalErrorHandler)
}