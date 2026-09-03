import express from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  getReviews,
  getReview,
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public listing
router.get("/", getReviews);
router.get("/:id", getReview);

// Auth required for write ops
router.post("/", verifyJWT, createReview);
router.put("/:id", verifyJWT, updateReview);
router.delete("/:id", verifyJWT, deleteReview);

export default router;
