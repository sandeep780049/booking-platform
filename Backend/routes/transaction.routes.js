import express from 'express';
import {
  triggerManualPayout,
  getPayoutHistory,
  getPayoutStats,
  getSystemStatus
} from '../controllers/transaction.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { verifyAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

// Admin routes for payout management
router.route('/payout/trigger').post(verifyJWT, verifyAdmin, triggerManualPayout);
router.route('/payout/history').get(verifyJWT, getPayoutHistory);
router.route('/payout/stats').get(verifyJWT, verifyAdmin, getPayoutStats);

// System health and status routes
router.route('/system/status').get(verifyJWT, verifyAdmin, getSystemStatus);

export default router;
