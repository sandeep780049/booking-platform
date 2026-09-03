import { Router } from "express";
import { getChatHistory, markMessageAsRead, getSenders } from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Routes
router.get("/", getChatHistory);
router.get("/senders", getSenders);
router.patch("/:messageId/read", markMessageAsRead);

export default router;