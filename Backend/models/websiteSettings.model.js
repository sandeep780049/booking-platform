import mongoose from "mongoose";

const websiteSettingsSchema = new mongoose.Schema(
  {
    // Feature toggles
    shopEnabled: {
      type: Boolean,
      default: true,
      description: "Controls visibility of shop pages throughout the website",
    },
    hotelsEnabled: {
      type: Boolean,
      default: true,
      description: "Controls visibility of hotel pages throughout the website",
    },
    // Metadata
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
websiteSettingsSchema.index({}, { unique: true });

export const WebsiteSettings = mongoose.model(
  "WebsiteSettings",
  websiteSettingsSchema
);
