import { model, Schema } from "mongoose";
import { CouponType } from "../../src/utils/constant/enums.js";


const couponSchema = new Schema({

    couponCode: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    discountAmount: {
        type: Number,
        min: 1,

    },
    type: {
        type: String,
        enum: Object.values(CouponType),
        default: CouponType.PERCENTAGE
    },
    fromDate: {
        type: String,
        default: Date.now()

    },
    toDate: {
        type: String,
        default: Date.now() + (24 * 60 * 60 * 1000)

    },
    assignUser: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        maxUse: {
            type: Number, default: 10, max: 10

        }

    }],
    createdBy: {
        type:Schema.Types.ObjectId,
        ref:"User",
    }




}, { timestamps: true })


//model

export const Coupon = model('Coupon', couponSchema)