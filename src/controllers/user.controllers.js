import { asyncHandler } from "../utils/asyncHandler.js";
import {APIError} from "../utils/apierror.js"
import {User} from "../model/user.model.js"
import {uploadOnClodinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/Apiresoponse.js";

const regesiterUser = asyncHandler(async (req, res) => {
     // get user detailes from frontent
     // validation - not empty
     // check if user already exists : username, email
     // check for images, check for avatar 
     // upload them to cloudinary , avatar
     // create user object - create entry in db 
     // remove password and refresh token field from response 
     // check for user creation 
     // return res
     const {fullName , email, username, password } = req.body
     console.log("email",email);
     console.log("password",password);
     
     if (
        [fullName,email,username,password].some((field) => field?.trim() === "")
     ) {
        throw new APIError(400 , "all field is required")
     }

     const existedUser = User.findOne({
      $or : [{username}, {email}]
     })

     if (existedUser) {
      throw new APIError(409,"this username or email is already exists")
     }
     const avatarLocalPath = req.files?.avatar[0]?.path
     const coverImageLocalPath = req.files?.avatar[0]?.path

     if (!avatarLocalPath) {
      throw new APIError(400.,"avatar is required")
     }

   const avatar = await uploadOnClodinary(avatarLocalPath)
   const coverImage = await uploadOnClodinary(coverImageLocalPath)

   if(!avatar){
      throw new APIError(400.,"avatar is required")
   }

  const user = await User.create({
      fullName,
      avatar : avatar.url,
      coverImage : coverImage?.url || "",
      email,
      password,
      username : username.toLowerCase()
   })

   const createduser = await User.findById(user._id).select(
      "-password -refreshToken"
   )

   if (createduser) {
      throw new APIError(500,"something went wrong while registering the user")
   }

   return res.status(201).json(
      new ApiResponse(200,createduser,"user created succesfully")
   )
})

export { regesiterUser }