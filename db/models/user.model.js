import { Schema, model } from "mongoose";
import path from 'path'
import { roles, status } from "../../src/utils/constant/enums.js";
import dotenv from 'dotenv'
import { hashPassword } from "../../src/utils/hashAndcompare.js";
dotenv.config({ path: path.resolve('./config/.env') })
const userSchema = new Schema({

    userName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    phoneNumber: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    role: {//admin customer seller
        type: String,
        default: roles.CUSTOMER,
        enum: Object.values(roles) //['admin','customer','seller']
    },
    status: {
        type: String,
        enum: Object.values(status),
        default: status.PENDING
    },
    isActive: {
        type: Boolean,
        default: false
    },
    image: {
        type: Object, //{secure_url:"",public_id:""}
        default: { secure_url: process.env.SECURE_URL, public_id: process.env.PUBLIC_ID }
    },
    DOB: {
        type: Date,
    },
    address: [{
        street: String,
        city: String,
        phone: String
    }],
    wishlist: [{
       
            type:Schema.Types.ObjectId,
            ref:"Product"

    }, ],
    otp:{
        type:Number
    },
    otpExpiry:Date
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    })


// //hooks
// userSchema.pre('save', async function (next) {
//     if (this.isModified('password')) {
//         this.password = hashPassword({ password: this.password });
//     }
//     next();
// });

//model
export const User = model('User', userSchema)