import { Schema, model } from 'mongoose'
import { orderStatus, payment } from '../../src/utils/constant/enums.js'


const orderSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product"
        },
        title: String,
        itemprice: Number,
        quantity: Number,
        finalPrice: Number,
        name: String
    }],
    address: { type: String, required: true },
    phone: { type: String, required: true },
    coupon: {
        couponId: {
            type: Schema.Types.ObjectId,
            ref: "Coupon"
        },
        couponCode: {
            type: String
        },
        discountAmount: {
            type: Number
        }
    },
    status: {
        type: String,
        enums: Object.values(orderStatus),
        default: orderStatus.PLACED
    },
    payment: {
        type: String,
        enums:Object.values(payment) ,
        required: true

    },
    orderprice:Number,
    finalPrice:Number

}, { timestamps: true })


export const Order = model('Order', orderSchema)