import express from "express";
import { getUserAchievements } from "../controllers/acheivment.controller.js";
import {
  deleteUser,
  getMe,
  getUser,
  getUserAdventure,
  getUserAdventureExperiences,
  getUsers,
  updateUserProfile,
  updateUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin, requirePermission } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { PERMISSIONS } from "../config/permissions.js";

const router = express.Router();

// User's own profile routes (any authenticated user)
router.get("/me", verifyJWT, getMe);
router.get("/profile", verifyJWT, getUser);
router.put("/profile", verifyJWT, upload.single("profilePicture"), updateUserProfile);
router.get("/adventure-experiences", verifyJWT, getUserAdventureExperiences);
router.get("/adventure", verifyJWT, getUserAdventure);
router.get("/getUserAchievements", verifyJWT, getUserAchievements);

// Admin routes for user management (requires VIEW_USERS/MANAGE_USERS permission)
router.get("/", verifyJWT, verifyAdmin, requirePermission(PERMISSIONS.VIEW_USERS), getUsers);
router.put("/:id", verifyJWT, verifyAdmin, requirePermission(PERMISSIONS.MANAGE_USERS), updateUser);
router.delete("/:id", verifyJWT, verifyAdmin, requirePermission(PERMISSIONS.MANAGE_USERS), deleteUser);

export default router;
