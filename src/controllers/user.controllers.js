import { asyncHandler } from "../utils/asyncHandler.js";

const regesiterUser = asyncHandler(async (req, res) => {
     res.status(200).json({
        message: "dilshan.d3"
    })
})

export { regesiterUser }