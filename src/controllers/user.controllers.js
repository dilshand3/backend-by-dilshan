import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apierror.js";
import { User } from "../model/user.model.js";
import { uploadOnClodinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresoponse.js";

const regesiterUser = asyncHandler(async (req,res) => {
   const {fullName,email,username,password} = req.body

   if ([fullName,email,username,password].some((field) => field?.trim() === "")) {
      throw new APIError(400, "All field are required")
   }

   const existedUser = await User.findOne({
      $or: [{username},{email}] 
   })
   if (existedUser) {
      throw new APIError(409,"User is already existed")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;

   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
      coverImageLocalPath = req.files.coverImage[0].path
   }

   if(!avatarLocalPath){
      throw new APIError(400,"Avatar file is required")
   }

   const avatar = await uploadOnClodinary(avatarLocalPath)
   const coverImage = await uploadOnClodinary(coverImageLocalPath)

   if(!avatar){
      throw new APIError(400,"Avatar file is required")
   }

   const user = await User.create({
      fullName,
      avatar : avatar.url,
      coverImage : coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
   })

   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )

   if (!createdUser) {
      throw new APIError(500,"something went wrong while registering the user")
   }

   return res.status(201).json(
      new ApiResponse(200,createdUser,"User register succesfully")
   )
})

export { regesiterUser };