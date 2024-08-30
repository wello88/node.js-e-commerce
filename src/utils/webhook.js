import Stripe from "stripe";
import { Cart, Order, Product } from "../../db/index.js";
import { asyncHandler } from "./apperror.js";

export const webhook =asyncHandler(
    async (req, res) => {
        const sig = req.headers['stripe-signature'].toString()
        const stripe = new Stripe(process.env.STRIPE_KEY)
        let event = stripe.webhooks.constructEvent(req.body, sig,'whsec_YXsvLqn8SEDStqZZOA57ej55WQ3602ws');


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