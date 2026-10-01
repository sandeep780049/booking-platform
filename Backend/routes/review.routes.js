import express from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  getReviews,
  getReview,
  getReviewSummary,
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public listing
router.get("/", getReviews);
// Must be registered before "/:id", otherwise "summary" is matched as an id.
router.get("/summary", getReviewSummary);
router.get("/:id", getReview);

// Auth required for write ops
router.post("/", verifyJWT, createReview);
router.put("/:id", verifyJWT, updateReview);
router.delete("/:id", verifyJWT, deleteReview);

export default router;
