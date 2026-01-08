import { User } from "../../../db/models/user.model.js"
import { Product } from "../../../db/models/product.model.js"
import { Order } from "../../../db/models/order.model.js"
import { Category } from "../../../db/models/category.model.js"
import { Brand } from "../../../db/models/brand.model.js"
import { Coupon } from "../../../db/models/coupon.model.js"
import { AppError } from "../../utils/apperror.js"
import cloudinary from "../../utils/cloudinary.js"
import { roles, status, orderStatus } from "../../utils/constant/enums.js"
import { messages } from "../../utils/constant/messages.js"
import { hashPassword } from "../../utils/hashAndcompare.js"

// Get dashboard statistics
export const getDashboardStats = async (req, res, next) => {
    // Get counts
    const [
        totalUsers,
        totalProducts,
        totalOrders,
        totalCategories,
        totalBrands
    ] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Category.countDocuments(),
        Brand.countDocuments()
    ])

    // Get order statistics
    const orderStats = await Order.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenue: { $sum: '$finalPrice' }
            }
        }
    ])

    // Calculate total revenue (excluding cancelled orders)
    const totalRevenue = await Order.aggregate([
        { $match: { status: { $ne: orderStatus.CANCELLED } } },
        { $group: { _id: null, total: { $sum: '$finalPrice' } } }
    ])

    // Get recent orders
    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'userName email')
        .select('status finalPrice createdAt payment')

    // Get low stock products
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
        .sort({ stock: 1 })
        .limit(10)
        .select('title stock mainImage price')

    // Get top selling products
    const topSellingProducts = await Order.aggregate([
        { $unwind: '$products' },
        { $group: { 
            _id: '$products.productId', 
            totalSold: { $sum: '$products.quantity' },
            revenue: { $sum: '$products.finalPrice' }
        }},
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        { $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
        }},
        { $unwind: '$product' },
        { $project: {
            _id: '$product._id',
            title: '$product.title',
            mainImage: '$product.mainImage',
            totalSold: 1,
            revenue: 1
        }}
    ])

    // Get orders by date (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const ordersByDate = await Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            revenue: { $sum: '$finalPrice' }
        }},
        { $sort: { _id: 1 } }
    ])

    return res.status(200).json({
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: {
            counts: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalCategories,
                totalBrands
            },
            orderStats,
            totalRevenue: totalRevenue[0]?.total || 0,
            recentOrders,
            lowStockProducts,
            topSellingProducts,
            ordersByDate
        }
    })
}

// Add user 
export const AddUser = async (req, res, next) => {
    const { userName, email, phone, role } = req.body
    
    // Check existence
    const queryConditions = [{ email }]
    if (phone) {
        queryConditions.push({ phoneNumber: phone })
    }
    const userExist = await User.findOne({ $or: queryConditions })

    if (userExist) {
        return next(new AppError(messages.user.alreadyExist, 409))
    }

    // Upload image
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: "e/users" })
        req.body.image = { secure_url, public_id }
    }

    const hashedpassword = hashPassword({ password: '123' })
    const createdUser = await User.create({
        userName,
        email,
        phoneNumber: phone,
        role,
        password: hashedpassword,
        status: status.VERIFIED,
        image: req.body.image
    })

    if (!createdUser) {
        return next(new AppError(messages.user.failtocreate, 500))
    }

    return res.status(201).json({
        message: messages.user.createSuccessfully,
        success: true,
        data: createdUser
    })
}

// Get all users
export const getAllUsers = async (req, res, next) => {
    const { page = 1, limit = 20, role, status: userStatus } = req.query
    
    const query = {}
    if (role) query.role = role
    if (userStatus) query.status = userStatus

    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))

    const total = await User.countDocuments(query)

    return res.status(200).json({
        message: messages.user.getsuccessfully,
        success: true,
        data: users,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    })
}

// Get specific user
export const getSpecificUser = async (req, res, next) => {
    const { userId } = req.params
    const user = await User.findById(userId).select('-password')
    
    if (!user) {
        return next(new AppError(messages.user.notfound, 404))
    }

    return res.status(200).json({
        message: messages.user.getsuccessfully,
        success: true,
        data: user
    })
}

// Update user
export const updateUser = async (req, res, next) => {
    const { userName, email, phone, role } = req.body
    const { userId } = req.params

    const userExist = await User.findById(userId)
    if (!userExist) {
        return next(new AppError(messages.user.notfound, 404))
    }

    // Update image
    if (req.file) {
        // Delete old image if exists
        if (userExist.image?.public_id) {
            await cloudinary.uploader.destroy(userExist.image.public_id)
        }
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: "e/users" })
        req.body.image = { secure_url, public_id }
    }

    const updateData = {}
    if (userName) updateData.userName = userName
    if (email) updateData.email = email
    if (phone) updateData.phoneNumber = phone
    if (role) updateData.role = role
    if (req.body.image) updateData.image = req.body.image

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password')
    
    if (!updatedUser) {
        return next(new AppError(messages.user.failtoUpdate, 500))
    }

    return res.status(200).json({
        message: messages.user.updateSuccessfully,
        success: true,
        data: updatedUser
    })
}

// Delete user
export const deleteUser = async (req, res, next) => {
    const { userId } = req.params
    const userExist = await User.findById(userId)
    
    if (!userExist) {
        return next(new AppError(messages.user.notfound, 404))
    }

    // Don't delete admin users
    if (userExist.role === roles.ADMIN) {
        return next(new AppError('Cannot delete admin user', 400))
    }

    // Delete user image from cloudinary
    if (userExist.image?.public_id) {
        await cloudinary.uploader.destroy(userExist.image.public_id)
    }

    await User.findByIdAndDelete(userId)

    return res.status(200).json({
        message: messages.user.deleteSuccessfully,
        success: true
    })
}
