import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { RegistrationLimit } from "../models/registrationLimit.model.js";
import { Instructor } from "../models/instructor.model.js";

export const createLimit = asyncHandler(async (req, res) => {
  const { adventure, location, limit } = req.body;

  if (!adventure || !location || !limit) {
    throw new ApiError(400, "Adventure, location, and limit are required");
  }

  if (limit < 1) {
    throw new ApiError(400, "Limit must be at least 1");
  }

  const existingLimit = await RegistrationLimit.findOne({
    adventure,
    location,
  });

  if (existingLimit) {
    throw new ApiError(
      400,
      "Limit already exists for this adventure-location combination",
    );
  }

  const currentCount = await Instructor.countDocuments({
    adventure,
    location,
    registrationStatus: "active",
    documentVerified: { $in: ["pending", "verified"] },
  });

  const registrationLimit = await RegistrationLimit.create({
    adventure,
    location,
    limit,
    currentCount,
  });

  const populated = await RegistrationLimit.findById(registrationLimit._id)
    .populate("adventure", "name")
    .populate("location", "name");

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        populated,
        "Registration limit created successfully",
      ),
    );
});

export const updateLimit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit } = req.body;

  if (!limit || limit < 1) {
    throw new ApiError(400, "Limit must be at least 1");
  }

  const registrationLimit = await RegistrationLimit.findById(id);

  if (!registrationLimit) {
    throw new ApiError(404, "Registration limit not found");
  }

  registrationLimit.limit = limit;
  await registrationLimit.save();

  const populated = await RegistrationLimit.findById(id)
    .populate("adventure", "name")
    .populate("location", "name");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        populated,
        "Registration limit updated successfully",
      ),
    );
});

export const deleteLimit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const registrationLimit = await RegistrationLimit.findByIdAndDelete(id);

  if (!registrationLimit) {
    throw new ApiError(404, "Registration limit not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, null, "Registration limit deleted successfully"),
    );
});

export const getAllLimits = asyncHandler(async (req, res) => {
  const limits = await RegistrationLimit.find()
    .populate("adventure", "name")
    .populate("location", "name address")
    .populate({
      path: "waitlist",
      select: "description documentVerified",
      populate: {
        path: "adventure location",
        select: "name",
      },
    })
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(200, limits, "Registration limits fetched successfully"),
    );
});

export const getLimitByAdventureLocation = asyncHandler(async (req, res) => {
  const { adventureId, locationId } = req.params;

  const limit = await RegistrationLimit.findOne({
    adventure: adventureId,
    location: locationId,
  })
    .populate("adventure", "name")
    .populate("location", "name address")
    .populate({
      path: "waitlist",
      select: "description documentVerified",
    });

  if (!limit) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "No limit set for this adventure-location combination",
        ),
      );
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, limit, "Registration limit fetched successfully"),
    );
});

export const moveFromWaitlist = asyncHandler(async (req, res) => {
  const { limitId, instructorId } = req.body;

  if (!limitId || !instructorId) {
    throw new ApiError(400, "Limit ID and instructor ID are required");
  }

  const limit = await RegistrationLimit.findById(limitId);

  if (!limit) {
    throw new ApiError(404, "Registration limit not found");
  }

  if (!limit.waitlist.includes(instructorId)) {
    throw new ApiError(404, "Instructor not found in waitlist");
  }

  const instructor = await Instructor.findById(instructorId);

  if (!instructor) {
    throw new ApiError(404, "Instructor not found");
  }

  if (limit.currentCount >= limit.limit) {
    throw new ApiError(400, "Limit reached, cannot move from waitlist");
  }

  instructor.registrationStatus = "active";
  await instructor.save();

  limit.waitlist.pull(instructorId);
  limit.currentCount += 1;
  await limit.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { instructor, limit },
        "Instructor moved from waitlist successfully",
      ),
    );
});
