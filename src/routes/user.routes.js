import { Router } from "express";
import { loggedOutUser, loginUser, regesiterUser } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js"
// import { verify } from "jsonwebtoken";
import pkg from 'jsonwebtoken';
const { verify } = pkg;

const router = Router()

router.route("/register").post(
    upload.fields([
        {
          name : "avatar",
          maxCount : 1  
        },{
            name : "coverImage",
            maxCount : 1  
        }
    ]),
    regesiterUser)

router.route("/login").post(loginUser)

router.route("/logout").post(verify,loggedOutUser)

export default router