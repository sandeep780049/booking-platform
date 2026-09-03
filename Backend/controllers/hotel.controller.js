import { Hotel } from "../models/hotel.model.js";
import { User } from "../models/user.model.js";
import { Location } from "../models/location.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import sendEmail from "../utils/sendOTP.js";
import { Otp } from "../models/otp.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import {
  translateObjectFields,
  translateObjectsFields,
} from "../utils/translation.js";
import { getLanguage } from "../middlewares/language.middleware.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_VALIDITY_MS = 10 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 6;
const HOTEL_CATEGORY_CAMPING = "camping";
const USER_ROLE_ADMIN = "admin";
const USER_ROLE_SUPERADMIN = "superadmin";

const validateEmail = (email) => {
  if (!email || !email.trim()) {
    throw new ApiError(400, "Email is required");
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }
  return email.trim();
};

const uploadSingleFile = async (fileArr) => {
  if (!fileArr || !fileArr[0]) return null;
  const uploaded = await uploadOnCloudinary(fileArr[0].path);
  return uploaded?.url || null;
};

const uploadMultipleFiles = async (fileArr) => {
  if (!fileArr || fileArr.length === 0) return [];
  const uploadPromises = fileArr.map((file) => uploadOnCloudinary(file.path));
  const results = await Promise.all(uploadPromises);
  return results.filter((r) => r?.url).map((r) => r.url);
};

const validateRequiredFiles = (files) => {
  if (!files.businessLicense || !files.businessLicense[0]) {
    throw new ApiError(400, "Business license document is required");
  }
  if (!files.hotelImages || files.hotelImages.length === 0) {
    throw new ApiError(400, "At least one hotel image is required");
  }
};

const uploadHotelFiles = async (files) => {
  const [
    profileImageUrl,
    businessLicenseUrl,
    taxCertificateUrl,
    insuranceDocumentUrl,
    hotelImagesUrls,
  ] = await Promise.all([
    uploadSingleFile(files.profileImage),
    uploadSingleFile(files.businessLicense),
    uploadSingleFile(files.taxCertificate),
    uploadSingleFile(files.insuranceDocument),
    uploadMultipleFiles(files.hotelImages),
  ]);

  if (!businessLicenseUrl) {
    throw new ApiError(500, "Failed to upload business license");
  }
  if (hotelImagesUrls.length === 0) {
    throw new ApiError(500, "Failed to upload hotel images");
  }

  return {
    profileImageUrl,
    businessLicenseUrl,
    taxCertificateUrl,
    insuranceDocumentUrl,
    hotelImagesUrls,
  };
};

const validateLocation = async (locationId) => {
  const locationExists = await Location.findById(locationId);
  if (!locationExists) {
    throw new ApiError(400, "Invalid location selected");
  }
};

const parseArrayField = (field) => {
  return Array.isArray(field)
    ? field.filter((item) => item)
    : field
      ? [field]
      : [];
};

const isCampingCategory = (categoryValue) => {
  return categoryValue?.toLowerCase() === HOTEL_CATEGORY_CAMPING;
};

const extractAdminFromToken = async (req) => {
  try {
    const authHeader = req.header("Authorization");
    const token =
      req.cookies?.accessToken ||
      (authHeader?.startsWith("Bearer ")
        ? authHeader.replace("Bearer ", "").trim()
        : null);

    if (!token || token === "" || token === "null" || token === "undefined") {
      return null;
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -reviews",
    );

    if (!user) {
      return null;
    }

    return user.role === USER_ROLE_ADMIN || user.role === USER_ROLE_SUPERADMIN
      ? user
      : null;
  } catch (error) {
    return null;
  }
};

export const verifyHotel = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const validatedEmail = validateEmail(email);
  await checkUserExists(validatedEmail);

  const otp = Math.floor(100000 + Math.random() * 900000);
  await Otp.deleteMany({ userId: validatedEmail });
  await Otp.create({ userId: validatedEmail, otp });

  await sendEmail({
    to: validatedEmail,
    subject: "Hotel Registration OTP Verification",
    text: `Your OTP for hotel registration is: ${otp}. This OTP is valid for 10 minutes.`,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { email: validatedEmail },
        "OTP sent to email. Please verify to complete registration.",
      ),
    );
});

export const HotelRegistration = asyncHandler(async (req, res) => {
  const adminUser = await extractAdminFromToken(req);
  const isAdminCreation = !!adminUser;

  const {
    email,
    otp,
    name,
    password,
    description,
    location,
    address,
    phone,
    category,
    price,
    pricePerNight,
    rating,
    website,
    socials,
    managerName,
    rooms,
    amenities,
  } = req.body;

  const validatedEmail = validateEmail(email);

  let otpRecord = null;
  if (!isAdminCreation) {
    if (!otp) {
      throw new ApiError(400, "OTP is required");
    }
    if (!password) {
      throw new ApiError(400, "Password is required");
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new ApiError(
        400,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      );
    }

    otpRecord = await Otp.findOne({
      userId: validatedEmail,
      otp,
      verified: false,
    });
    if (!otpRecord) {
      throw new ApiError(400, "Invalid or expired OTP");
    }

    const otpAge = Date.now() - otpRecord.createdAt.getTime();
    if (otpAge > OTP_VALIDITY_MS) {
      await otpRecord.deleteOne();
      throw new ApiError(400, "OTP has expired. Please request a new one.");
    }
  }

  if (!name || !location || !address || !phone || !managerName) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const isCamping = isCampingCategory(category);

  if (!isCamping && !rooms) {
    throw new ApiError(
      400,
      "Number of rooms is required for non-camping properties",
    );
  }

  await validateLocation(location);

  const files = req.files || {};
  validateRequiredFiles(files);

  const {
    profileImageUrl,
    businessLicenseUrl,
    taxCertificateUrl,
    insuranceDocumentUrl,
    hotelImagesUrls,
  } = await uploadHotelFiles(files);

  let user;
  try {
    user = await User.create({
      email: validatedEmail,
      password: isAdminCreation ? undefined : password,
      role: "hotel",
      verified: isAdminCreation,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "User already exists with this email");
    }
    throw error;
  }

  const finalPrice = pricePerNight
    ? Number(pricePerNight)
    : price
      ? Number(price)
      : 0;

  const hotel = await Hotel.create({
    name: name.trim(),
    location,
    fullAddress: address.trim(),
    contactNo: phone.trim(),
    managerName: managerName.trim(),
    category: category || "hotel",
    noRoom: isCamping ? 0 : Number(rooms),
    description: description?.trim() || "",
    price: finalPrice,
    pricePerNight: finalPrice,
    rating: rating ? Number(rating) : 0,
    amenities: parseArrayField(amenities),
    socials: parseArrayField(socials),
    logo: profileImageUrl,
    medias: hotelImagesUrls,
    website: website?.trim() || "",
    license: businessLicenseUrl,
    certificate: taxCertificateUrl,
    insurance: insuranceDocumentUrl,
    owner: user._id,
    verified: isAdminCreation ? "approved" : "pending",
  });

  if (otpRecord) {
    await otpRecord.deleteOne();
  }

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user, hotel },
        isAdminCreation
          ? "Hotel created successfully by admin."
          : "Hotel registered successfully. Please wait for admin approval.",
      ),
    );
});

export const getHotelDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const language = getLanguage(req);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid hotel id");
  }

  const hotel = await Hotel.findById(id)
    .populate("owner", "name email")
    .populate("location", "name address");

  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  const plainHotel = hotel.toJSON();

  let translatedHotel;
  if (language !== "en") {
    const fieldsToTranslate = ["description", "category", "amenities"];
    translatedHotel = await translateObjectFields(
      plainHotel,
      fieldsToTranslate,
      language,
    );
  } else {
    translatedHotel = plainHotel;
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { hotel: translatedHotel },
        "Hotel details retrieved successfully",
      ),
    );
});

export const getHotelById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const language = getLanguage(req);

  const hotelData = await Hotel.find({ owner: id })
    .populate("owner", "name email")
    .populate("location", "name address");

  if (!hotelData || hotelData.length === 0) {
    throw new ApiError(404, "Hotel not found");
  }

  const plainHotelData = hotelData.map((hotel) => hotel.toJSON());

  let hotel;
  if (language !== "en") {
    const fieldsToTranslate = ["description", "category", "amenities"];
    hotel = await translateObjectsFields(
      plainHotelData,
      fieldsToTranslate,
      language,
    );
  } else {
    hotel = plainHotelData;
  }

  res
    .status(200)
    .json(new ApiResponse(200, { hotel }, "Hotel retrieved successfully"));
});

export const getHotel = asyncHandler(async (req, res) => {
  const {
    search = "",
    page = 1,
    limit = 10,
    verified,
    location,
    category,
    minPrice,
    maxPrice,
    minRating,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const language = getLanguage(req);

  let query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  if (location) {
    const locationDoc = await Location.findOne({
      name: { $regex: location, $options: "i" },
    });

    if (locationDoc) {
      query.location = locationDoc._id;
    } else {
      query.location = location;
    }
  }

  if (category) {
    query.category = { $regex: category, $options: "i" };
  }

  if (verified) {
    query.verified = verified;
  }

  if (minPrice || maxPrice) {
    query.pricePerNight = {};
    if (minPrice) query.pricePerNight.$gte = Number(minPrice);
    if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
  }

  if (minRating) {
    query.rating = { $gte: Number(minRating) };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
  let hotels = await Hotel.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("owner", "name email")
    .populate("location", "name address");

  const plainHotels = hotels.map((hotel) => hotel.toJSON());
  const total = await Hotel.countDocuments(query);

  if (language !== "en" && plainHotels.length > 0) {
    const fieldsToTranslate = ["description", "category", "amenities"];
    hotels = await translateObjectsFields(
      plainHotels,
      fieldsToTranslate,
      language,
    );
  } else {
    hotels = plainHotels;
  }

  const result = {
    hotels,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
  };

  res.status(200).json(result);
});

export const approveHotel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hotel = await Hotel.findByIdAndUpdate(
    id,
    { verified: "approved" },
    { new: true },
  );
  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, { hotel }, "Hotel approved successfully"));
});

export const rejectHotel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hotel = await Hotel.findByIdAndUpdate(
    id,
    { verified: "rejected" },
    { new: true },
  );
  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, { hotel }, "Hotel rejected successfully"));
});

export const updateHotelRating = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (!rating || rating < 0 || rating > 5) {
    throw new ApiError(400, "Rating must be between 0 and 5");
  }

  const hotel = await Hotel.findByIdAndUpdate(
    id,
    { rating: Number(rating) },
    { new: true },
  );

  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, { hotel }, "Hotel rating updated successfully"));
});

export const updateHotelPrice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pricePerNight, price } = req.body;

  const updateData = {};
  if (pricePerNight) updateData.pricePerNight = Number(pricePerNight);
  if (price) updateData.price = Number(price);

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "Please provide pricePerNight or price to update");
  }

  const hotel = await Hotel.findByIdAndUpdate(id, updateData, { new: true });

  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, { hotel }, "Hotel price updated successfully"));
});

export const updateHotel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    contactNo,
    managerName,
    fullAddress,
    price,
    pricePerNight,
    noRoom,
    website,
    amenities,
    category,
  } = req.body;

  const existingHotel = await Hotel.findById(id);
  if (!existingHotel) {
    throw new ApiError(404, "Hotel not found");
  }

  if (req.user && existingHotel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You don't have permission to update this hotel");
  }

  const updateData = {};

  const finalCategory =
    category !== undefined ? category : existingHotel.category;
  const isCamping = isCampingCategory(finalCategory);

  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description.trim();
  if (contactNo !== undefined) updateData.contactNo = contactNo.trim();
  if (managerName !== undefined) updateData.managerName = managerName.trim();
  if (fullAddress !== undefined) updateData.fullAddress = fullAddress.trim();
  if (website !== undefined) updateData.website = website.trim();
  if (category !== undefined) updateData.category = category;

  if (price !== undefined) updateData.price = Number(price);
  if (pricePerNight !== undefined) {
    updateData.pricePerNight = Number(pricePerNight);
    if (price === undefined) updateData.price = Number(pricePerNight);
  }

  if (isCamping && noRoom !== undefined) {
    throw new ApiError(
      400,
      "Number of rooms cannot be set for camping properties",
    );
  }

  if (category !== undefined && isCampingCategory(category)) {
    updateData.noRoom = 0;
  } else if (noRoom !== undefined) {
    updateData.noRoom = Number(noRoom);
  }

  if (amenities !== undefined) {
    updateData.amenities = parseArrayField(amenities);
  }

  const files = req.files || {};

  if (files.profileImage && files.profileImage[0]) {
    const uploaded = await uploadOnCloudinary(files.profileImage[0].path);
    if (uploaded?.url) updateData.logo = uploaded.url;
  }

  if (files.hotelImages && files.hotelImages.length > 0) {
    const uploadPromises = files.hotelImages.map((file) =>
      uploadOnCloudinary(file.path),
    );
    const results = await Promise.all(uploadPromises);
    const urls = results.filter((r) => r?.url).map((r) => r.url);
    if (urls.length > 0) {
      updateData.medias = [...(existingHotel.medias || []), ...urls];
    }
  }

  const hotel = await Hotel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("owner", "name email")
    .populate("location", "name address");

  res
    .status(200)
    .json(new ApiResponse(200, { hotel }, "Hotel updated successfully"));
});
