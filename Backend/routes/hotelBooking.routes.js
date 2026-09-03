import express from "express";
import {
  createHotelBooking,
  getAllHotelBookings,
  getHotelBookingsByUserId,
  getMyHotelBookings,
  getHotelBookingById,
  getHotelBookingsByHotelId,
  updateHotelBookingStatus,
  cancelHotelBooking,
  deleteHotelBooking,
} from "../controllers/hotelBooking.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

// Middleware to verify JWT token for all routes
router.use(verifyJWT);

// Create a new hotel booking
router.route("/create").post(createHotelBooking);

// Get current user's hotel bookings
router.route("/my-bookings").get(getMyHotelBookings);

// Get all hotel bookings (admin only)
router.route("/").get(verifyAdmin, getAllHotelBookings);

// Get hotel bookings by user ID (admin only)
router.route("/user/:userId").get(verifyAdmin, getHotelBookingsByUserId);

// Get hotel bookings by hotel ID (for hotel owners)
router.route("/hotel/:hotelId").get(getHotelBookingsByHotelId);

// Get a specific hotel booking by ID
router.route("/:id").get(getHotelBookingById);

// Update hotel booking status (admin only)
router.route("/:id/status").put(verifyAdmin, updateHotelBookingStatus);

// Cancel hotel booking (user can cancel their own)
router.route("/:id/cancel").put(cancelHotelBooking);

// Delete hotel booking (admin only)
router.route("/:id").delete(verifyAdmin, deleteHotelBooking);

export default router;
