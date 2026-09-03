import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
  clearCache,
  getCacheStats,
  preloadTranslations,
} from "../controllers/translation.controller.js";

const router = express.Router();

// Protected routes - require authentication
router.use(verifyJWT);

// Admin only routes
router.get("/cache/stats", verifyAdmin, getCacheStats);
router.delete("/cache", verifyAdmin, clearCache);
router.post("/preload", verifyAdmin, preloadTranslations);

export default router;
