import { Instructor } from "../models/instructor.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

export const getAllInstructors = asyncHandler(async (req, res) => {
  const { page, limit = 10, search = "", status } = req.query;

  const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
  const pageSize = Math.max(1, Number.parseInt(limit, 10) || 10);

  const searchTerm = typeof search === "string" ? search.trim() : "";
  const filter = { role: "instructor" };

  if (status && status !== "all" && status !== "") {
    const instructors = await Instructor.find({ documentVerified: status }).select("_id");
    const instructorIds = instructors.map((inst) => inst._id);
    filter.instructor = { $in: instructorIds };
  }

  if (searchTerm) {
    filter.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
      { phoneNumber: { $regex: searchTerm, $options: "i" } },
    ];
  }

  const instructors = await User.find(filter)
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .populate({
      path: "instructor",
      populate: [
        {
          path: "adventure",
          select: "name",
        },
        {
          path: "location",
          select: "name",
        },
      ],
      select: "documentVerified certificate governmentId avgReview commissionPercentage",
    })
    .select("email name phoneNumber profilePicture instructor");

  const total = await User.countDocuments(filter);
  const totalPages = Math.ceil(total / pageSize);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        instructors,
        total,
        totalPages,
        page: pageNumber,
        limit: pageSize
      },
      "Instructors retrieved successfully"
    )
  );
});

export const getInstructorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const instructor = await User.findOne({
    role: "instructor",
    instructor: id
  })
    .populate({
      path: "instructor",
      populate: [
        {
          path: "adventure",
          select: "name",
        },
        {
          path: "location",
          select: "name",
        },
      ],
      select: "documentVerified certificate governmentId avgReview commissionPercentage",
    })
    .select("email name phoneNumber profilePicture instructor");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        instructor,
      },
      "Instructor retrieved successfully"
    )
  );
});

export const deleteInstructor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const instructor = await User.findById(id);
  if (!instructor) {
    throw new ApiError(404, "Instructor not found");
  }

  await User.findByIdAndDelete(id);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Instructor deleted successfully"));
});

export const changeDocumentStatusById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const instructor = await Instructor.findById(id);
  if (!instructor) {
    throw new ApiError(404, "Instructor not found");
  }

  if (status !== "verified" && status !== "rejected") {
    throw new ApiError(400, "Invalid status");
  }
  instructor.documentVerified = status;
  await instructor.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Instructor document status updated successfully"
      )
    );
});

export const updateInstructor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { commissionPercentage } = req.body;

  const instructor = await Instructor.findById(id);
  if (!instructor) {
    throw new ApiError(404, "Instructor not found");
  }

  if (commissionPercentage !== undefined) {
    if (commissionPercentage < 0 || commissionPercentage > 100) {
      throw new ApiError(400, "Commission percentage must be between 0 and 100");
    }
    instructor.commissionPercentage = commissionPercentage;
  }

  await instructor.save();

  res.status(200).json(
    new ApiResponse(
      200,
      instructor,
      "Instructor updated successfully"
    )
  );
});

export const addPortfolioMedia = asyncHandler(async (req, res) => {
  if (!req.user?.instructor) {
    throw new ApiError(403, "Only instructors can upload media");
  }

  if (!req.file) {
    throw new ApiError(400, "Media file is required");
  }

  const instructor = await Instructor.findById(req.user.instructor);

  if (!instructor) {
    throw new ApiError(404, "Instructor profile not found");
  }

  const uploadResult = await uploadOnCloudinary(req.file.path);

  if (!uploadResult?.secure_url && !uploadResult?.url) {
    throw new ApiError(500, "Failed to upload media");
  }

  const mediaUrl = uploadResult.secure_url || uploadResult.url;

  instructor.portfolioMedias.push(mediaUrl);
  await instructor.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        mediaUrl,
        portfolioMedias: instructor.portfolioMedias,
      },
      "Media added to portfolio successfully"
    )
  );
});

export const removePortfolioMedia = asyncHandler(async (req, res) => {
  if (!req.user?.instructor) {
    throw new ApiError(403, "Only instructors can remove media");
  }

  const { mediaUrl } = req.body;

  if (!mediaUrl || typeof mediaUrl !== "string") {
    throw new ApiError(400, "Media URL is required");
  }

  const instructor = await Instructor.findById(req.user.instructor);

  if (!instructor) {
    throw new ApiError(404, "Instructor profile not found");
  }

  const mediaIndex = instructor.portfolioMedias.findIndex(
    (storedUrl) => storedUrl === mediaUrl
  );

  if (mediaIndex === -1) {
    throw new ApiError(404, "Media not found in portfolio");
  }

  const [removedMedia] = instructor.portfolioMedias.splice(mediaIndex, 1);
  await instructor.save();

  if (removedMedia?.startsWith("http")) {
    let publicId;

    const uploadPath = removedMedia.split("/upload/")?.[1];
    if (uploadPath) {
      publicId = uploadPath
        .replace(/\?.*$/, "")
        .replace(/v\d+\//, "")
        .replace(/\.[^/.]+$/, "");
    } else {
      const urlParts = removedMedia.split("/");
      const publicIdWithExt = urlParts[urlParts.length - 1];
      publicId = publicIdWithExt?.split(".")?.[0];
    }

    if (publicId) {
      await deleteFromCloudinary(publicId);
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        removedMedia: mediaUrl,
        portfolioMedias: instructor.portfolioMedias,
      },
      "Media removed from portfolio successfully"
    )
  );
});
