//import modules

import fs from "fs"
import path from "path"
import multer,{diskStorage} from "multer";
import { nanoid } from "nanoid";

const fileValidation = {
    image:['image/jpg','image/jpeg','image/png'],
    file:['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    video:['video/mp4']
}

export const fileupload = ({folder,allowFile = fileValidation.image})=>{
  const storage =   diskStorage({
        destination:(req,file,cb) =>{
            const fullpath = path.resolve(`uploads/${folder}`)
            if(!fs.existsSync(fullpath)){

                fs.mkdirSync(fullpath,{recursive:true})
            }

            cb(null,`uploads/${folder}`)
        },
        filename:(req,file,cb)=>{
            cb(null,nanoid()+"-"+file.originalname)
        }
    })
    const fileFilter = (req,file,cb)=>{
        if(allowFile.includes(file.mimetype)){
            return cb(null,true)
        }
        return cb(new Error("file not allowed"),false)
    }
    return multer({storage,fileFilter})
}