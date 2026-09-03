import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import express from "express";
import {
  getWebsiteSettings,
  updateWebsiteSettings,
  getPublicWebsiteSettings,
} from "../controllers/websiteSettings.controller.js";

const websiteSettingsRouter = express.Router();

// Public route for getting website settings (no authentication required)
websiteSettingsRouter.get("/public", getPublicWebsiteSettings);

// Protected admin routes
websiteSettingsRouter.use(verifyJWT);
websiteSettingsRouter.use(verifyAdmin);

websiteSettingsRouter.get("/", getWebsiteSettings);
websiteSettingsRouter.put("/", updateWebsiteSettings);

export default websiteSettingsRouter;
