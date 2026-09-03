import express from "express";
import {
  getAllDeclarations,
  getDeclarationById,
  getDeclarationByTitleAndVersion,
  getDeclarationsByAdventureId,
  createDeclaration,
  updateDeclaration,
  deleteDeclaration,
  getLatestDeclarationByTitle,
} from "../controllers/declaration.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { languageMiddleware } from "../middlewares/language.middleware.js";

const router = express.Router();

// Apply language middleware to all routes
router.use(languageMiddleware);

// Public routes - anyone can view declarations
router.get("/", getAllDeclarations); // Get all declarations
router.get("/search", getDeclarationByTitleAndVersion); // Get declarations by title and/or version (?title=...&version=...)
router.get("/adventure/:adventureId", getDeclarationsByAdventureId); // Get declarations by adventure ID
router.get("/latest/:title", getLatestDeclarationByTitle); // Get latest declaration by title
router.get("/:id", getDeclarationById); // Get declaration by ID

// Protected routes - require admin authentication
router.use(verifyJWT);
router.use(verifyAdmin);

router.post("/", createDeclaration); // Create new declaration
router.put("/:id", updateDeclaration); // Update declaration
router.delete("/:id", deleteDeclaration); // Delete declaration

export default router;
