import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apierror.js";
import { User } from "../model/user.model.js";
import { uploadOnClodinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresoponse.js";
const genrateAccessAndRefreshToken = async(userId) =>{
   try {
      const user = await User.findById(userId)
     const accessToken = user.genrateAccessToken()
     const refreshToken =  user.genrateRefreshToken()

     user.refreshToken = refreshToken
     user.save({validateBeforeSave : false})

     return {accessToken,refreshToken}
   } catch (error) {
      throw new APIError(500,"something went wrong while genrating access and refresh token")
   }
}

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

const loginUser = asyncHandler(async (req,res) => {
 
   //req body = data
   //username or email
   //find the user
   //password check
   //acces and refresh token
   //send cookie

   const {email,username,password} = req.body

   if (!username && !email) {//there were a || gate last time so you can changed time
      throw new APIError(400,"email or username is required")
   }

   const user = await  User.findOne({
      $or : [{username},{email}]
   })

   if (!user) {
      throw new APIError(404,"User doesn't exist")
   }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
      throw new APIError(401,"User password is in correct")
   }
  const {accessToken,refreshToken} = await genrateAccessAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const option = {
   httpOnly : true,
   secure : true
  }

  return res.status(200).cookie("accesToken",accessToken,option)
  .cookie("refreshToken",refreshToken,option)
  .json(
   new ApiResponse(200,{
      user : loggedInUser,accessToken,refreshToken
   },
"user logged in succesfully")
  )
})

// const loggedOutUser = asyncHandler(async (req, res) => {
//    await User.findByIdAndUpdate(
//        req.user._id,
//        {
//            $set: {
//                refreshToken: undefined
//            }
//        },
//        {
//            new: true
//        }
//    );
//    const option = {
//       httpOnly : true,
//       secure : true
//      }

//      return res
//      .status(200)
//      .clearCookie("accessToken",option)
//      .clearCookie("refreshToken",option)
//      .json(new ApiResponse(200,{}, "user logged out"))
// });

const loggedOutUser = asyncHandler(async(req, res) => {
   await User.findByIdAndUpdate(
       req.user._id,
       {
           $unset: {
               refreshToken: 1 // this removes the field from document
           }
       },
       {
           new: true
       }
   )

   const options = {
       httpOnly: true,
       secure: true
   }

   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new ApiResponse(200, {}, "User logged Out"))
})

export { regesiterUser,
   loginUser,
   loggedOutUser
 };