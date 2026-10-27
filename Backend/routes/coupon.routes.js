import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
  validateCoupon,
  listCoupons,
  createCoupon,
  toggleCoupon,
  deleteCoupon,
} from "../controllers/coupon.controller.js";

const router = Router();

// Signed-in users can check a coupon before checkout
router.post("/validate", verifyJWT, validateCoupon);

// Admin management
router.use("/", verifyAdmin);
router.route("/").get(listCoupons).post(createCoupon);
router.patch("/:id/toggle", toggleCoupon);
router.route("/:id").delete(deleteCoupon);

export default router;
