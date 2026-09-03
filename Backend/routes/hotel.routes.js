import express from "express";

import {
  approveHotel,
  getHotel,
  getHotelById,
  getHotelDetails,
  HotelRegistration,
  rejectHotel,
  updateHotel,
  updateHotelPrice,
  updateHotelRating,
  verifyHotel,
} from "../controllers/hotel.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { languageMiddleware } from "../middlewares/language.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  verifyAdmin,
  requirePermission,
} from "../middlewares/admin.middleware.js";
import { PERMISSIONS } from "../config/permissions.js";

const router = express.Router();

// Apply language middleware to all routes
router.use(languageMiddleware);

// Public routes
router.route("/").post(
  upload.fields([
    { name: "businessLicense", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
    { name: "taxCertificate", maxCount: 1 },
    { name: "insuranceDocument", maxCount: 1 },
    { name: "hotelImages", maxCount: 5 },
  ]),
  HotelRegistration,
);

router.route("/verify").post(verifyHotel);
router.route("/details/:id").get(getHotelDetails);
router.route("/:id").get(getHotelById);
router.route("/").get(getHotel);

// Admin routes for hotel management (requires MANAGE_HOTELS permission)
router
  .route("/approve/:id")
  .put(
    verifyJWT,
    verifyAdmin,
    requirePermission(PERMISSIONS.MANAGE_HOTELS),
    approveHotel,
  );
router
  .route("/reject/:id")
  .put(
    verifyJWT,
    verifyAdmin,
    requirePermission(PERMISSIONS.MANAGE_HOTELS),
    rejectHotel,
  );
router
  .route("/rating/:id")
  .put(
    verifyJWT,
    verifyAdmin,
    requirePermission(PERMISSIONS.MANAGE_HOTELS),
    updateHotelRating,
  );
router
  .route("/price/:id")
  .put(
    verifyJWT,
    verifyAdmin,
    requirePermission(PERMISSIONS.MANAGE_HOTELS),
    updateHotelPrice,
  );
router.route("/update/:id").put(
  verifyJWT,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "hotelImages", maxCount: 5 },
  ]),
  updateHotel,
);

export default router;
