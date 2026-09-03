import { WebsiteSettings } from "../models/websiteSettings.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get website settings
export const getWebsiteSettings = asyncHandler(async (req, res) => {
  try {
    let settings = await WebsiteSettings.findOne().populate(
      "lastUpdatedBy",
      "name email"
    );

    // Create default settings if none exist
    if (!settings) {
      settings = await WebsiteSettings.create({
        shopEnabled: true,
        hotelsEnabled: true,
        lastUpdatedBy: req.user._id,
      });

      // Populate the lastUpdatedBy field for the response
      settings = await WebsiteSettings.findById(settings._id).populate(
        "lastUpdatedBy",
        "name email"
      );
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          settings,
          "Website settings retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error retrieving website settings");
  }
});

// Update website settings
export const updateWebsiteSettings = asyncHandler(async (req, res) => {
  try {
    const { shopEnabled, hotelsEnabled } = req.body;

    // Validate input
    if (typeof shopEnabled !== "boolean" && shopEnabled !== undefined) {
      throw new ApiError(400, "shopEnabled must be a boolean value");
    }
    if (typeof hotelsEnabled !== "boolean" && hotelsEnabled !== undefined) {
      throw new ApiError(400, "hotelsEnabled must be a boolean value");
    }

    let settings = await WebsiteSettings.findOne();

    if (!settings) {
      // Create new settings if none exist
      settings = await WebsiteSettings.create({
        shopEnabled: shopEnabled !== undefined ? shopEnabled : true,
        hotelsEnabled: hotelsEnabled !== undefined ? hotelsEnabled : true,
        lastUpdatedBy: req.user._id,
      });
    } else {
      // Update existing settings
      const updateData = {
        lastUpdatedBy: req.user._id,
      };

      if (shopEnabled !== undefined) updateData.shopEnabled = shopEnabled;
      if (hotelsEnabled !== undefined) updateData.hotelsEnabled = hotelsEnabled;

      settings = await WebsiteSettings.findByIdAndUpdate(
        settings._id,
        updateData,
        { new: true }
      );
    }

    // Populate the lastUpdatedBy field for the response
    settings = await WebsiteSettings.findById(settings._id).populate(
      "lastUpdatedBy",
      "name email"
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, settings, "Website settings updated successfully")
      );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Error updating website settings");
  }
});

// Get public website settings (for frontend to check feature availability)
export const getPublicWebsiteSettings = asyncHandler(async (req, res) => {
  try {
    let settings = await WebsiteSettings.findOne().select(
      "shopEnabled hotelsEnabled maintenanceMode"
    );

    // Return default settings if none exist
    if (!settings) {
      settings = {
        shopEnabled: true,
        hotelsEnabled: true,
      };
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          settings,
          "Public website settings retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error retrieving public website settings");
  }
});
