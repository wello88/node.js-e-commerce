import { Cart, Coupon, Order, Product } from "../../../db/index.js"
import { AppError } from "../../utils/apperror.js"
import { CouponType, orderStatus, payment } from "../../utils/constant/enums.js"
import { messages } from "../../utils/constant/messages.js"

// Create order (Cash on Delivery only)
export const createOrder = async (req, res, next) => {
    const { address, phone, coupon } = req.body
    let couponExist = null
    let discountAmount = 0

    // Check coupon if provided
    if (coupon) {
        couponExist = await Coupon.findOne({ couponCode: coupon })
        if (!couponExist) {
            return next(new AppError(messages.coupon.notfound, 404))
        }
        if (couponExist.fromDate > Date.now() || couponExist.toDate < Date.now()) {
            return next(new AppError('Invalid coupon or has been expired', 400))
        }
    }

    // Check cart
    const cart = await Cart.findOne({ user: req.authUser._id }).populate('products.productId')
    if (!cart || !cart.products || cart.products.length === 0) {
        return next(new AppError('Cart is empty', 400))
    }

    // Process products
    let orderProducts = []
    let orderprice = 0

    for (const item of cart.products) {
        const product = item.productId
        if (!product) {
            return next(new AppError(messages.product.notfound, 404))
        }

        if (!product.inStock(item.quantity)) {
            return next(new AppError(`${product.title} is out of stock`, 400))
        }

        const itemFinalPrice = product.price - (product.price * ((product.discount || 0) / 100))
        
        // Decrement product stock
        await Product.findByIdAndUpdate(product._id, {
            $inc: { stock: -item.quantity }
        })

        orderProducts.push({
            productId: product._id,
            title: product.title,
            itemprice: product.price,
            quantity: item.quantity,
            finalPrice: itemFinalPrice * item.quantity,
            name: product.title
        })

        orderprice += itemFinalPrice * item.quantity
    }

    // Calculate final price with coupon
    let finalPrice = orderprice
    if (couponExist) {
        if (couponExist.type === CouponType.FIXED) {
            discountAmount = couponExist.discountAmount
            finalPrice = orderprice - discountAmount
        } else {
            discountAmount = orderprice * (couponExist.discountAmount / 100)
            finalPrice = orderprice - discountAmount
        }
    }

    // Create order
    const order = new Order({
        user: req.authUser._id,
        products: orderProducts,
        address,
        phone,
        coupon: couponExist ? {
            couponId: couponExist._id,
            couponCode: couponExist.couponCode,
            discountAmount
        } : undefined,
        status: orderStatus.PLACED,
        payment: payment.CASH,
        orderprice,
        finalPrice
    })

    const createdOrder = await order.save()
    if (!createdOrder) {
        return next(new AppError(messages.order.failtocreate, 500))
    }

    // Clear the cart after successful order
    await Cart.findOneAndUpdate(
        { user: req.authUser._id },
        { $set: { products: [] } }
    )

    return res.status(201).json({
        success: true,
        message: messages.order.createSuccessfully,
        data: createdOrder
    })
}

// Get user's orders
export const getOrders = async (req, res, next) => {
    const { page = 1, limit = 10, status } = req.query
    
    const query = { user: req.authUser._id }
    if (status) {
        query.status = status
    }

    const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('products.productId', 'mainImage')

    const total = await Order.countDocuments(query)

    return res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: orders,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    })
}

// Get single order by ID
export const getOrderById = async (req, res, next) => {
    const { orderId } = req.params

    const order = await Order.findOne({ 
        _id: orderId, 
        user: req.authUser._id 
    }).populate('products.productId', 'mainImage title slug')

    if (!order) {
        return next(new AppError(messages.order.notfound, 404))
    }

    return res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: order
    })
}

// Cancel order (only if status is 'placed')
export const cancelOrder = async (req, res, next) => {
    const { orderId } = req.params

    const order = await Order.findOne({ 
        _id: orderId, 
        user: req.authUser._id 
    })

    if (!order) {
        return next(new AppError(messages.order.notfound, 404))
    }

    if (order.status !== orderStatus.PLACED) {
        return next(new AppError('Order cannot be cancelled at this stage', 400))
    }

    // Restore product stock
    for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity }
        })
    }

    order.status = orderStatus.CANCELLED
    await order.save()

    return res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
    })
}

// Admin: Get all orders
export const getAllOrders = async (req, res, next) => {
    const { page = 1, limit = 10, status, sort = '-createdAt' } = req.query
    
    const query = {}
    if (status) {
        query.status = status
    }

    const orders = await Order.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('user', 'userName email phoneNumber')
        .populate('products.productId', 'mainImage title')

    const total = await Order.countDocuments(query)

    return res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: orders,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    })
}

// Admin: Update order status
export const updateOrderStatus = async (req, res, next) => {
    const { orderId } = req.params
    const { status } = req.body

    if (!Object.values(orderStatus).includes(status)) {
        return next(new AppError('Invalid order status', 400))
    }

    const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
    ).populate('user', 'userName email')

    if (!order) {
        return next(new AppError(messages.order.notfound, 404))
    }

    return res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order
    })
}

// Admin: Get order statistics
export const getOrderStats = async (req, res, next) => {
    const stats = await Order.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalRevenue: { $sum: '$finalPrice' }
            }
        }
    ])

    const totalOrders = await Order.countDocuments()
    const totalRevenue = await Order.aggregate([
        { $match: { status: { $ne: orderStatus.CANCELLED } } },
        { $group: { _id: null, total: { $sum: '$finalPrice' } } }
    ])

    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'userName email')

    return res.status(200).json({
        success: true,
        message: 'Order statistics retrieved successfully',
        data: {
            byStatus: stats,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            recentOrders
        }
    })
}
