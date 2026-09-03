import express from "express";
import {
  createBatchPayout,
  getBatchPayouts,
  getUserPayouts,
  linkPayPalAccount,
  paypalCallback,
  getSuccessPage,
  paypalOnboardingComplete,
  getPayPalLinkStatus
} from "../controllers/payout.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/batch", verifyJWT, createBatchPayout);
router.get("/batch/:batchId", verifyJWT, getBatchPayouts);
router.get("/user/:userId", verifyJWT, getUserPayouts);

// PayPal linking routes
router.post("/connect", verifyJWT, linkPayPalAccount);
router.get("/paypal-onboarding-complete", paypalOnboardingComplete);
router.get("/callback", paypalCallback);
router.post("/success", getSuccessPage);
router.get("/status", getPayPalLinkStatus);
router.get("/status/:userId", getPayPalLinkStatus);

export default router;
