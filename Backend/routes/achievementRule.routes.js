import express from "express";
import {
  createRule,
  updateRule,
  deleteRule,
  listRules,
  evaluateMyAchievements,
  // Instructor achievement rule methods
  createInstructorRule,
  updateInstructorRule,
  deleteInstructorRule,
  listInstructorRules,
  getInstructorRule,
  evaluateInstructorAchievements,
  evaluateSpecificInstructor,
  evaluateAllInstructors,
  getInstructorAchievements,
} from "../controllers/achievementRule.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

// =================== USER ACHIEVEMENT RULES ===================
// Admin endpoints for user achievement rules
router.post("/", verifyJWT, verifyAdmin, createRule);
router.put("/:id", verifyJWT, verifyAdmin, updateRule);
router.delete("/:id", verifyJWT, verifyAdmin, deleteRule);

// Public/admin list
router.get("/", verifyJWT, listRules);

// Evaluate my achievements now
router.post("/evaluate", verifyJWT, evaluateMyAchievements);

// Admin endpoints for instructor achievement rules
router.post("/instructor", verifyJWT, verifyAdmin, createInstructorRule);
router.get("/instructor", verifyJWT, verifyAdmin, listInstructorRules);

// Instructor achievement evaluation endpoints (place before parameterized routes)
router.post("/instructor/evaluate", verifyJWT, evaluateInstructorAchievements);
router.post(
  "/instructor/evaluate/:instructorId",
  verifyJWT,
  verifyAdmin,
  evaluateSpecificInstructor
);
router.post(
  "/instructor/evaluate-all",
  verifyJWT,
  verifyAdmin,
  evaluateAllInstructors
);

// Get instructor achievements (place before parameterized routes)
router.get("/instructor/achievements", verifyJWT, getInstructorAchievements);
router.get(
  "/instructor/achievements/:instructorId",
  verifyJWT,
  getInstructorAchievements
);

// Parameterized routes must come last to avoid conflicts
router.get("/instructor/:id", verifyJWT, getInstructorRule);
router.put("/instructor/:id", verifyJWT, verifyAdmin, updateInstructorRule);
router.delete("/instructor/:id", verifyJWT, verifyAdmin, deleteInstructorRule);

export default router;
