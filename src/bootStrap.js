import Stripe from "stripe";
import express from "express"
import path from "path"
import dotenv from 'dotenv'
import { connectDB } from "../db/connection.js"
import { Cart, Order, Product } from "../db/index.js";
import { asyncHandler } from "./utils/apperror.js"
import * as allRouters from './index.js'
import { globalErrorHandler } from "./utils/apperror.js"

dotenv.config({ path: path.resolve('./config/.env') })


export const bootStrap = (app) => {
    app.post('/webhook',express.raw({type: 'application/json'}),
        asyncHandler(
            async (req, res) => {
                const sig = req.headers['stripe-signature'].toString()
                const stripe = new Stripe(process.env.STRIPE_KEY)
                let event = stripe.webhooks.constructEvent(req.body, sig,'whsec_vfvnEzZMRniDnjSpA2wGDKsQqt2muljs');
        
        
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
    
    
    )
    
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