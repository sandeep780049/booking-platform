import { UserAchievement } from "../models/userAchievement.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getUserAchievements = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userAchievement = await UserAchievement.findOne({ userId: userId });
  if (!userAchievement) {
    throw new ApiError(404, "User achievements not found");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userAchievement,
        "User achievements retrieved successfully"
      )
    );
});
