import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin, requirePermission } from "../middlewares/admin.middleware.js";
import { PERMISSIONS } from "../config/permissions.js";

import {
  changeDocumentStatusById,
  deleteInstructor,
  getAllInstructors,
  getInstructorById,
  addPortfolioMedia,
  removePortfolioMedia,
  updateInstructor,
} from "../controllers/instructor.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Middleware to verify JWT token
router.use(verifyJWT);

// Public instructor routes (any authenticated user can view)
router.get("/", getAllInstructors);
router.get("/:id", getInstructorById);

// Instructor's own portfolio management
router.post("/portfolio", upload.single("media"), addPortfolioMedia);
router.delete("/portfolio", removePortfolioMedia);

// Admin routes for instructor management (requires MANAGE_INSTRUCTORS permission)
router.delete("/:id", verifyAdmin, requirePermission(PERMISSIONS.MANAGE_INSTRUCTORS), deleteInstructor);
router.put("/:id", verifyAdmin, requirePermission(PERMISSIONS.MANAGE_INSTRUCTORS), changeDocumentStatusById);
router.patch("/:id", verifyAdmin, requirePermission(PERMISSIONS.MANAGE_INSTRUCTORS), updateInstructor);

export default router;
