//import modules
import dotenv from "dotenv"
import express from "express"
import path from "path"
import { bootStrap } from "./src/bootStrap.js"
const app = express()
dotenv.config({path: path.resolve('./config/.env')})
bootStrap(app,express)