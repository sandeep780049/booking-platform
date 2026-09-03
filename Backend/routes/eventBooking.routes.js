import express from "express";
import {
  createEventBooking,
  handleEventBookingWebhook,
  handlePayPalEventBookingWebhook,
  getEventBookingById,
  getMyEventBookings,
  cancelEventBooking,
  getAllEventBookings,
  getPaymentStatus,
  getOrderDetails,
  setupWebhook,
  completeAdventure,
  getEventAdventures,
  getAllAdventuresForSelection,
  awardNft,
  deleteEventBooking,
} from "../controllers/eventBooking.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin, verifyInstructor } from "../middlewares/admin.middleware.js";

const router = express.Router();

// Public routes (webhooks)
router.post("/webhook", handleEventBookingWebhook); // Webhook for Revolut payment updates
router.post("/webhook/paypal", handlePayPalEventBookingWebhook); // Webhook for PayPal payment updates

// Protected routes (require authentication)
router.use(verifyJWT);

router.post("/", createEventBooking); // Create event booking with payment order
router.get("/user", getMyEventBookings); // Get current user's event bookings
router.get("/:id", getEventBookingById); // Get specific event booking
router.get("/:bookingId/payment-status", getPaymentStatus); // Get payment status
router.get("/order/:orderId", getOrderDetails); // Get order details from Revolut
router.patch("/:id/cancel", cancelEventBooking); // Cancel event booking
router.post("/setup-webhook", setupWebhook); // Setup Revolut webhook
router.patch("/:bookingId/adventure/:adventureId/complete", completeAdventure); // Complete adventure
router.get("/events/:eventId/adventures", getEventAdventures); // Get adventures for specific event

// Admin routes
router.get("/", verifyInstructor, getAllEventBookings); // Admin: Get all event bookings
router.get("/adventures/all", verifyAdmin, getAllAdventuresForSelection); // Admin: Get all adventures for selection
router.patch("/:bookingId/award-nft", verifyAdmin, awardNft); // Admin: Award NFT manually
router.delete("/:id", verifyAdmin, deleteEventBooking); // Admin: Delete event booking

export default router;
