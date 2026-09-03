import { Router } from "express";
import {
  createSessionBooking,
  getAllSessionBookings,
  getSessionBookingsByUserId,
  getCurrentUserSessionBookings,
  getSessionBookingById,
  updateSessionBookingStatus,
  cancelSessionBooking,
  deleteSessionBooking,
  getSessionBookingsBySessionId,
} from "../controllers/sessionBooking.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin, verifyInstructor } from "../middlewares/admin.middleware.js";

const router = Router();

// Public routes (none for session bookings - all require authentication)

// Protected routes (require authentication)
router.use(verifyJWT); // Apply authentication middleware to all routes below

// User routes
router.route("/create").post(createSessionBooking);
router.route("/my-bookings").get(getCurrentUserSessionBookings);
router.route("/session/:sessionId").get(getSessionBookingsBySessionId);
router.route("/:bookingId").get(getSessionBookingById);
router.route("/:bookingId/status").patch(updateSessionBookingStatus);
router.route("/:bookingId/cancel").patch(cancelSessionBooking);

// Admin routes
router.route("/").get(verifyInstructor, getAllSessionBookings);
router.route("/user/:userId").get(verifyAdmin, getSessionBookingsByUserId);
router.route("/:bookingId").delete(verifyAdmin, deleteSessionBooking);

export default router;
