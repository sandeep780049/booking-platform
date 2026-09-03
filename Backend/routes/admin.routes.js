import {
  verifyAdmin,
  requirePermission,
  requireSuperAdmin,
} from "../middlewares/admin.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { PERMISSIONS } from "../config/permissions.js";

import express from "express";
import {
  createAdmin,
  deleteAdmin,
  getAllAdmins,
  getDashboardStats,
  getDashboardLocations,
  updateAdmin,
  getAdminPermissions,
  getAdventureInsights,
} from "../controllers/admin.controller.js";

const adminRouter = express.Router();

// Apply JWT verification to all admin routes
adminRouter.use(verifyJWT);
adminRouter.use(verifyAdmin);

// Dashboard - all admins can view
adminRouter.get("/dashboard/stats", getDashboardStats)
adminRouter.get("/dashboard/locations", getDashboardLocations)
adminRouter.get("/adventure-insights/:adventureId", getAdventureInsights);

// Get current user's permissions (for frontend RBAC)
adminRouter.get("/permissions", getAdminPermissions);

// Admin management - Super Admin only
adminRouter.post("/create", requireSuperAdmin, createAdmin);
adminRouter.get("/", requirePermission(PERMISSIONS.VIEW_ADMINS), getAllAdmins);
adminRouter.put("/:id", requireSuperAdmin, updateAdmin);
adminRouter.delete("/:id", requireSuperAdmin, deleteAdmin);

export default adminRouter;
