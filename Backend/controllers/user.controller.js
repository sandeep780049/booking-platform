import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";
import { Instructor } from "../models/instructor.model.js";
import { UserAdventureExperience } from "../models/userAdventureExperience.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      paypalLinked: user.paypalAccount?.linked || false,
    }, "User profile fetched successfully")
  );
});

export const getUser = asyncHandler(async (req, res) => {
  let user;
  if (req.user.role === "instructor") {
    user = await User.findById(req.user._id)
      .populate("instructor")
      .select("-password -refreshToken");
  } else if (req.user.role === "admin") {
    // Populate admin field for admin users to get adminRole
    user = await User.findById(req.user._id)
      .populate("admin")
      .select("-password -refreshToken");
  } else {
    user = req.user;
  }

  // Get overall level and adventure experiences
  const overallLevelData = await user.getOverallLevel();
  const adventureExperiences = await user.getAdventureExperiences();

  return res.status(200).json({
    ...user.toJSON(),
    levelData: overallLevelData,
    adventureExperiences: adventureExperiences,
  });
});

// GET /users?search=&role=&page=&limit=
export const getUsers = asyncHandler(async (req, res) => {
  const { search = "", role, page = 1, limit = 10 } = req.query;
  const query = {};
  if (role && role !== "all") {
    query.role = role;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select("_id name email role bookings createdAt");
  const total = await User.countDocuments(query);
  res.status(200).json({
    users,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
  });
});

export const getUserAdventure = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId)
    .populate("adventures")
    .select("name email adventures");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { adventures: user.adventures },
      "User adventures fetched successfully"
    )
  );
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(new ApiResponse(200, "User deleted successfully", user));
});

export const updateUser = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  // validate role value if provided
  if (role !== undefined) {
    const allowedRoles = ["user", "admin", "instructor", "hotel", "superadmin"];
    if (typeof role !== "string" || !allowedRoles.includes(role)) {
      throw new ApiError(400, "Invalid role value");
    }
  }

  // Fetch existing user
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  // Handle role transitions that require Admin document changes
  if (role && role !== existingUser.role) {
    // Promoting to admin: create Admin doc if not exists and attach
    if (role === 'admin' && existingUser.role !== 'admin') {
      const adminDoc = await Admin.create({ adminRole: [] });
      existingUser.admin = adminDoc._id;
    }

    // Demoting from admin: remove Admin doc if exists
    if (existingUser.role === 'admin' && role !== 'admin' && existingUser.admin) {
      try {
        await Admin.findByIdAndDelete(existingUser.admin);
      } catch (e) {
        // ignore
      }
      existingUser.admin = undefined;
    }

    existingUser.role = role;
  }

  // Apply other updates from req.body (excluding admin changes which are handled separately)
  const updatePayload = { ...req.body };
  delete updatePayload.admin; // prevent overwriting admin ref directly

  Object.assign(existingUser, updatePayload);

  await existingUser.save();

  return res.status(200).json(new ApiResponse(200, existingUser, 'User updated successfully'));
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const { name, bio, languages } = req.body;

  const user = await User.findById(userId).populate("instructor");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (typeof name === "string") {
    user.name = name.trim();
  }
  // Handle profile picture upload
  if (req.file) {
    // Upload new image to Cloudinary
    const uploadResult = await uploadOnCloudinary(req.file.path);

    if (!uploadResult) {
      throw new ApiError(500, "Failed to upload profile picture");
    }

    // Delete old profile picture from Cloudinary if it exists
    if (user.profilePicture) {
      // Extract public_id from the Cloudinary URL
      const urlParts = user.profilePicture.split('/');
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const publicId = publicIdWithExt.split('.')[0];

      // Delete old image
      await deleteFromCloudinary(publicId);
    }

    // Update user with new Cloudinary URL
    user.profilePicture = uploadResult.secure_url;
  }

  await user.save();

  if (user.instructor) {
    const instructor = await Instructor.findById(user.instructor._id);

    if (instructor) {
      if (bio !== undefined) {
        let bioArray;

        // Parse bio if it's a JSON string (from FormData)
        let parsedBio = bio;
        if (typeof bio === "string") {
          try {
            parsedBio = JSON.parse(bio);
          } catch (e) {
            // If parsing fails, treat as regular string
            parsedBio = bio;
          }
        }

        if (Array.isArray(parsedBio)) {
          bioArray = parsedBio
            .filter((entry) => typeof entry === "string")
            .map((entry) => entry.trim())
            .filter(Boolean);
        } else if (typeof parsedBio === "string") {
          bioArray = parsedBio
            .split(/\r?\n/)
            .map((entry) => entry.trim())
            .filter(Boolean);
        }

        if (bioArray !== undefined) {
          instructor.description = bioArray;
        }
      }

      if (languages !== undefined) {
        // Parse languages if it's a JSON string (from FormData)
        let parsedLanguages = languages;
        if (typeof languages === "string") {
          try {
            parsedLanguages = JSON.parse(languages);
          } catch (e) {
            // If parsing fails, ignore
            parsedLanguages = [];
          }
        }

        if (Array.isArray(parsedLanguages)) {
          instructor.languages = parsedLanguages
            .filter((language) => typeof language === "string")
            .map((language) => language.trim())
            .filter(Boolean);
        }
      }

      await instructor.save();
    }
  }

  const refreshedUser = await User.findById(userId)
    .populate("instructor")
    .select("-password -refreshToken");

  if (!refreshedUser) {
    throw new ApiError(404, "User not found");
  }

  const levelData = await refreshedUser.getOverallLevel();
  const adventureExperiences = await refreshedUser.getAdventureExperiences();

  return res.status(200).json({
    ...refreshedUser.toJSON(),
    levelData,
    adventureExperiences,
  });
});

export const getUserAdventureExperiences = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const adventureExperiences = await UserAdventureExperience.find({
    user: userId,
  })
    .populate("adventure", "name description medias thumbnail exp")
    .sort({ experience: -1 });

  const overallLevelData = await UserAdventureExperience.calculateOverallLevel(
    userId
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        adventureExperiences,
        levelData: overallLevelData,
      },
      "Adventure experiences fetched successfully"
    )
  );
});
