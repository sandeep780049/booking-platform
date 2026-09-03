import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      required: true,
    },
    profilePicture: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      index: true,
    },
    name: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
    },
    refreshToken: { type: String },

    role: {
      type: String,
      enum: ["user", "admin", "instructor", "hotel", "superadmin", "explorer"],
      default: "user",
    },

    level: {
      type: Number,
      default: 0,
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    adventures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Adventure",
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequests: [],

    paypalPayerId: {
      type: String,
      index: true, // PayPal Merchant ID
    },
    paypalMerchantId: {
      type: String,
      trim: true,
    },
    paypalEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    paypalLinkedAt: {
      type: Date,
    },
    paypalEmailConfirmed: {
      type: Boolean,
      default: false,
    },
    paypalAccountStatus: {
      type: String,
      enum: ["BUSINESS_ACCOUNT", "PERSONAL_ACCOUNT", "UNKNOWN"],
      default: "UNKNOWN",
    },
    paypalPermissionsGranted: {
      type: Boolean,
      default: false,
    },
    paypalConsentStatus: {
      type: Boolean,
      default: false,
    },
    paypalRiskStatus: {
      type: String,
      trim: true,
    },
    paypalTrackingId: {
      type: String,
      trim: true,
    },
    paypalOnboardingStarted: {
      type: Date,
    },
    paypalOnboardingCompleted: {
      type: Boolean,
      default: false,
    },
    paypalProductIntentId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.getOverallLevel = async function () {
  const { UserAdventureExperience } =
    await import("./userAdventureExperience.model.js");
  return await UserAdventureExperience.calculateOverallLevel(this._id);
};

userSchema.methods.getAdventureExperiences = async function () {
  const { UserAdventureExperience } =
    await import("./userAdventureExperience.model.js");
  return await UserAdventureExperience.find({ user: this._id })
    .populate("adventure", "name description medias thumbnail ")
    .sort({ experience: -1 });
};

export const User = mongoose.model("User", userSchema);
