import { Cart, Coupon, Order, Product } from "../../../db/index.js"
import { AppError } from "../../utils/apperror.js"
import { orderStatus } from "../../utils/constant/enums.js"
import { messages } from "../../utils/constant/messages.js"

//create order
export const createOrder = async (req, res, next) => {
    // get data from req 
    const { address, phone, coupon, payment } = req.body

    // check coupon
    const couponExist = await Coupon.findOne({ couponCode: coupon })
    if (!couponExist) {
        return next(new AppError(messages.coupon.notfound, 404))
    }
    if (couponExist.fromDate > Date.now() || couponExist.toDate < Date.now()) {
        return next(new AppError('invalid coupon or has been expired', 400))
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

    for (const product of products) {

        const productExist = await Product.findById(product._id)

        if (!productExist) {
            return next(new AppError(messages.product.notfound, 404))
        }
        if (!productExist.inStock(product.quantity) <= 0) {
            return next(new AppError('product out of stock', 400))

        }
        orderProducts.push({
            productId: productExist._id,
            title: productExist.title,
            itemPrice: productExist.finalPrice,
            quantity: product.quantity,
            finalPrice: product.quantity * productExist.finalPrice
        })
        orderprice += product.quantity * productExist.finalPrice

    }


    const order = new Order({
        user: req.authUser._id,
        products: orderProducts,
        address: address,
        phone: phone,
        coupon: {
            couponId: couponExist?._id,
            couponCode: couponExist?.couponCode,
            discountAmount: couponExist?.couponAmount,
        },
        status: orderStatus.PLACED,
        payment,
        orderprice,
        finalPrice: orderprice - (orderprice * ((couponExist?.couponAmount || 0) / 100))

    })

    const createdOrder = await order.save()
    if (!createdOrder) {
        return next(new AppError(messages.order.failtocreate, 500))
    }
    // if(payment == "visa"){
    //     ret
    // }

    return res.status(201).json({
        success: true,
        messages: messages.order.createSuccessfully,
        data: createdOrder
    })

}