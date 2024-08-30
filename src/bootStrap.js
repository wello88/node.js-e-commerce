import path from "path"
import { webhook } from "./utils/webhook.js";
import dotenv from 'dotenv'
import { connectDB } from "../db/connection.js"
import * as allRouters from './index.js'
import { globalErrorHandler } from "./utils/apperror.js"

dotenv.config({ path: path.resolve('./config/.env') })


export const bootStrap = (app,express) => {
    app.post('/webhook',
        express.raw({ type: 'application/json' }),
        webhook
      );
    app.use('/uploads', express.static('uploads'))
    app.use(express.json())
    connectDB()
    const port = process.env.PORT || 3000
    app.get("/", (req, res) => res.send("Hello World!"))
    app.listen(port, () => console.log(`app listening on port ${port}!`))
    app.use('/category', allRouters.categoryRouter)
    app.use('/sub-category', allRouters.subCategoryRouter)
    app.use('/brand', allRouters.brandRouter)
    app.use('/product', allRouters.productRouter)
    app.use('/auth', allRouters.authRouter)
    app.use('/admin', allRouters.adminRouter)
    app.use('/wishlist', allRouters.wishlistRouter)
    app.use('/review', allRouters.reviewRouter)
    app.use('/coupon', allRouters.couponRouter)
    app.use('/cart', allRouters.cartRouter)
    app.use('/user', allRouters.userRouter)
    app.use('/order', allRouters.orderRouter)
    app.use(globalErrorHandler)
}