import { Router } from "express";
import {
  createEvents,
  deleteEvent,
  getAllEvents,
  getEventById,
  updateEvent,
} from "../controllers/landing.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { languageMiddleware } from "../middlewares/language.middleware.js";

const router = Router();

// Apply language middleware to all routes
router.use(languageMiddleware);

router.post("/", verifyJWT, upload.fields([{ name: "medias" }]), createEvents);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.put("/:id", verifyJWT, upload.fields([{ name: "medias" }]), updateEvent);
router.delete("/:id", verifyJWT, deleteEvent);

export default router;
