import { Router } from "express";
import { regesiterUser } from "../controllers/user.controllers.js";
const router = Router()

router.route("/register").post(regesiterUser)

export default router