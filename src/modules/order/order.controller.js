import Stripe from "stripe"
import { Cart, Coupon, Order, Product } from "../../../db/index.js"

import { AppError } from "../../utils/apperror.js"
import { CouponType, orderStatus } from "../../utils/constant/enums.js"
import { messages } from "../../utils/constant/messages.js"

//create order
export const createOrder = async (req, res, next) => {
    // get data from req 
    const { address, phone, coupon, payment } = req.body
    let couponExist = ''
    // check coupon
    if (coupon) {
        couponExist = await Coupon.findOne({ couponCode: coupon })
        if (!couponExist) {
            return next(new AppError(messages.coupon.notfound, 404))
        }
        if (couponExist.fromDate > Date.now() || couponExist.toDate < Date.now()) {
            return next(new AppError('invalid coupon or has been expired', 400))
        }
    }

    //check cart
    const cart = await Cart.findOne({ user: req.authUser._id }).populate('products.productId')
    const products = cart.products
    if (products.length <= 0) {
        return next(new AppError('cart is empty', 400))
    }
    //check product
    let orderProducts = []
    let orderprice = 0
    let finalPrice = 0

    for (const product of products) {

        const productExist = await Product.findById(product.productId)

        if (!productExist) {
            return next(new AppError(messages.product.notfound, 404))
        }
        if (!productExist.inStock(product.quantity)) {
            return next(new AppError('product out of stock', 400))

        }
        orderProducts.push({
            productId: productExist._id,
            title: productExist.title,
            itemPrice: productExist.finalPrice,
            quantity: product.quantity,
            finalPrice: product.quantity * productExist.finalPrice,
            name: productExist.title
        })
        orderprice += product.quantity * productExist.finalPrice

    }

    couponExist.type == CouponType.FIXED
        ? finalPrice = (orderprice) - (couponExist.discountAmount)
        : finalPrice = orderprice - (orderprice * ((couponExist?.discountAmount || 0) / 100))

    const order = new Order({
        user: req.authUser._id,
        products: orderProducts,
        address,
        phone,
        coupon: {
            couponId: couponExist?._id,
            couponCode: couponExist?.couponCode,
            discountAmount: couponExist?.discountAmount,
        },
        status: orderStatus.PLACED,
        payment,
        orderprice,
        finalPrice

    })

    const createdOrder = await order.save()
    if (!createdOrder) {
        return next(new AppError(messages.order.failtocreate, 500))
    }
    //integrate payment getway
    if (payment == 'visa') {
        const stripe = new Stripe(process.env.STRIPE_KEY)
        const checkout = await stripe.checkout.sessions.create({
            success_url: 'https://www.google.com',
            cancel_url: 'https://www.facebook.com',
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: createdOrder.products.map((product) => {
                return {
                    price_data: {
                        currency: 'egp',
                        product_data: {
                            name: product.title,
                            //image:product.image

                        },
                        unit_amount: product.finalPrice * 100
                    },
                    quantity: product.quantity
                }

            })

        })
        return res.status(201).json({
            success: true,
            messages: messages.order.createSuccessfully,
            data: createdOrder,
            url: checkout.url
        })
    }

    return res.status(201).json({
        success: true,
        messages: messages.order.createSuccessfully,
        data: createdOrder
    })


}