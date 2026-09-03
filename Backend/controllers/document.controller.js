import { asyncHandler } from "../utils/asyncHandler.js";
import { Document } from "../models/document.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

export const createDocument = asyncHandler(async (req, res) => {
  const { country } = req.body;

  if (!country) {
    throw new ApiError(400, "Country is required");
  }

  if (!req.files || !req.files.document || !req.files.document[0]) {
    throw new ApiError(400, "Document file is required");
  }

  if (!req.files || !req.files.image || !req.files.image[0]) {
    throw new ApiError(400, "Image file is required");
  }

  const [documentUrl, imageUrl] = await Promise.all([
    uploadOnCloudinary(req.files.document[0].path),
    uploadOnCloudinary(req.files.image[0].path),
  ]);

  const document = await Document.create({
    documentUrl: documentUrl.secure_url,
    imageUrl: imageUrl.secure_url,
    country,
    owner: req.user._id,
  });

  res.status(201).json(
    new ApiResponse(201, "Document created successfully", {
      document,
    })
  );
});

export const getAllDocuments = asyncHandler(async (req, res) => {
  const { verified } = req.query;

  if (verified && !["false", "true"].includes(verified)) {
    throw new ApiError(400, "Invalid status value. Use 'true' or 'false");
  }

  const documents = await Document.find(
    verified ? { verified: verified === "true" } : {}
  )
    .populate("owner", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, "Documents retrieved successfully", {
      documents,
    })
  );
});

export const updateDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { verified } = req.body;

  if (verified === undefined) {
    throw new ApiError(400, "At least one field is required for update");
  }

  const document = await Document.findByIdAndUpdate(
    id,
    { verified },
    { new: true }
  );

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  const user = await User.findByIdAndUpdate(
    document.owner,
    { $set: { documentVerified: verified } },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(
    new ApiResponse(200, "Document updated successfully", {
      document,
    })
  );
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const document = await Document.findByIdAndDelete(id);

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  res.status(200).json(
    new ApiResponse(200, "Document deleted successfully", {
      document,
    })
  );
});

export const getDocumentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const document = await Document.findById(id).populate(
    "owner",
    "name email phoneNumber"
  );

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  res.status(200).json(
    new ApiResponse(200, "Document retrieved successfully", {
      document,
    })
  );
});

export const getDocumentByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const documents = await Document.find({ owner: id }).populate(
    "owner",
    "name email phoneNumber"
  );

  if (!documents) {
    throw new ApiError(404, "Documents not found for this user");
  }

  res.status(200).json(
    new ApiResponse(200, "Documents retrieved successfully", {
      documents,
    })
  );
});
