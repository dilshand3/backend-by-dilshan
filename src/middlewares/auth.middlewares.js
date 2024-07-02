import { APIError } from "../utils/apierror";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../model/user.model.js";

export const verifyjwt = asyncHandler(async(req,_,next) => {
try {
    const token = req.cookies?.accessToken || req.head("Authorization")?.replace("Bearer","")
    
    if(!token){
        throw new APIError(401,"unauthorized requrest")
    }
    
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
    if(!user){
        throw new APIError(401,"Invalid access token")
    }
    
    req.user = user
    next()
} catch (error) {
    throw new APIError(401,error?.message || "invalid access token")
}
})