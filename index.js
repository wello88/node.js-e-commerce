//import modules
import dotenv from "dotenv"
import express from "express"
import path from "path"

import { scheduleJob } from 'node-schedule'
import { bootStrap } from "./src/bootStrap.js"
import { User } from "./db/index.js"
import { status } from "./src/utils/constant/enums.js"
const app = express()


scheduleJob('1 1 1 * * *', async function()  {
   const users =  await User.findOneAndUpdate({ status: status.PENDING, createdAt: {$lte:Date.now() - 1 * 30 * 24 * 60 * 60 * 1000 }}).lean()
   const userIds = users.map((user) =>{return user._id})
   await User.deleteMany({ _id: { $in: userIds } })
   //delete images
   

})
dotenv.config({ path: path.resolve('./config/.env') })
bootStrap(app, express)