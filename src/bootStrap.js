import { connectDB } from "../db/connection.js"
// import adminRouter from "./modules/admin/admin.router.js"
// import authRouter from "./modules/auth/auth.router.js"
// import brandRouter from "./modules/brand/brand.router.js"
// import categoryRouter from "./modules/category/category.router.js"
// import productRouter from "./modules/product/product.router.js"
// import reviewRouter from "./modules/review/review.router.js"
// import subCategoryRouter from "./modules/subCategory/subCategory.router.js"
// import wishlistRouter from "./modules/wishlist/wishlist.router.js"
import Stripe from "stripe";
import { Cart, Order, Product } from "../db/index.js";
import { asyncHandler } from "./utils/apperror.js"
import * as allRouters from './index.js'
import { globalErrorHandler } from "./utils/apperror.js"
import express from "express"
import path from "path"
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve('./config/.env') })

export const webhook = asyncHandler(
    async (req, res) => {
        const sig = req.headers['stripe-signature'].toString()
        const stripe = new Stripe(process.env.STRIPE_KEY)
        let event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_vfvnEzZMRniDnjSpA2wGDKsQqt2muljs');


        // Handle the event checkout.session.completed
        if (event.type === 'checkout.session.completed') {
            const checkout = event.data.object
            //clear cart
            const orderId = checkout.metadata.orderId
            //update order status to placed
            const orderExist = await Order.findByIdAndUpdate(orderId, { status: 'placed' }, { new: true })
            const cart = await Cart.findOneAndUpdate({ user: orderExist.user }, { products: [] }, { new: true })
            for(const product of orderExist.products){
             await Product.findById(product.productId, { $inc: { stock: -product.quantity } })
            }
        }
        // return a 200 res to acknowledge receipt of the event
        res.send()
    })

export const bootStrap = (app) => {
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