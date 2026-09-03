import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  searchByEmailId,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriendsList,
  removeFriend,
} from "../controllers/friend.controller.js";

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// Search for users by email
router.get("/search", searchByEmailId);

// Get current user's friends list
router.get("/list", getFriendsList);

// Get friend requests (received, sent, or all)
router.get("/requests", getFriendRequests);

// Send a friend request
router.post("/request", sendFriendRequest);

// Accept a friend request
router.patch("/request/:requestId/accept", acceptFriendRequest);

// Reject a friend request
router.patch("/request/:requestId/reject", rejectFriendRequest);

// Remove a friend
router.delete("/:friendId", removeFriend);

export default router;
